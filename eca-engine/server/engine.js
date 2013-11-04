'use strict';

var cp = require('child_process'), ml = require('./module_loader'),
    poller, db, isRunning = true,
    qEvents = new (require('./queue')).Queue(); // export queue into redis

var regex = /\$X\.[\w\.\[\]]*/g, // find properties of $X
// var regex = /\$X\.([0-9A-z\.\[\]])*[A-z]/g, // find properties of $X
  listRules = {},
  listActionModules = {}, 
  actionsLoaded = false, eventsLoaded = false;

/**
 * Initialize the rules engine which initializes the module loader.
 */
function init(db_link, db_port, crypto_key) {
  db = db_link;
  loadActions();
  poller = cp.fork('./eventpoller', [db_port, crypto_key]);
  poller.on('message', function(evt) {
    if(evt.event === 'ep_finished_loading') {
      eventsLoaded = true;
      tryToLoadRules();
    } else pushEvent(evt);
  });
  //start to poll the event queue
  pollQueue();
}

function loadActions() {
  db.getActionModules(function(err, obj) {
    if(err) console.error(' | EN | ERROR retrieving Action Modules from DB!');
    else {
      if(!obj) {
        console.log(' | EN | No Action Modules found in DB!');
        actionsLoaded = true;
        tryToLoadRules();
      } else {
        var m, semaphore = 0;
        for(var el in obj) {
          semaphore++;
          console.log(' | EN | Loading Action Module from DB: ' + el);
          m = ml.requireFromString(obj[el], el);
          db.getActionModuleAuth(el, function(mod) {
            return function(err, obj) {
              if(--semaphore == 0) {
                actionsLoaded = true;
                tryToLoadRules();
              }
              if(obj && mod.loadCredentials) mod.loadCredentials(JSON.parse(obj));
            };
          }(m));
          listActionModules[el] = m;
        }
      }
      }
  });
}

function tryToLoadRules() {
  if(eventsLoaded && actionsLoaded) {
    db.getRules(function(err, obj) {
      for(var el in obj) loadRule(JSON.parse(obj[el]));
    });
  }
}

/**
 * Insert an action module into the list of available interfaces.
 * @param {Object} objModule the action module object
 */
function loadActionModule(name, objModule) {
  console.log(' | EN | Action module "' + name + '" loaded');
  listActionModules[name] = objModule;
}

/**
 * Insert a rule into the eca rules repository
 * @param {Object} objRule the rule object
 */
function loadRule(objRule) {
  //TODO validate rule
  console.log(' | EN | Loading Rule: ' + objRule.id);
  if(listRules[objRule.id]) console.log(' | EN | Replacing rule: ' + objRule.id);
  listRules[objRule.id] = objRule;
  
  //TODO rule will be instead of event: "mod":
  /*
   * event: {
   *   type: "mod",
   *   arguments: [
   *     ...
   *   ] 
   * }
   */
  
  // Notify poller about eventual candidate
  try {
    poller.send('event|'+objRule.event);
  } catch (err) {
    console.log(' | EN | ERROR: Unable to inform poller about new active rule!');
  }
}

function pollQueue() {
  if(isRunning) {
    var evt = qEvents.dequeue();
    if(evt) {
      processEvent(evt);
    }
    setTimeout(pollQueue, 50); //TODO adapt to load
  }
}

/**
 * Stores correctly posted events in the queue
 * @param {Object} evt The event object
 */
function pushEvent(evt) {
  qEvents.enqueue(evt);
}

/**
 * Handles correctly posted events
 * @param {Object} evt The event object
 */
function processEvent(evt) {
  console.log(' | EN | processing event: ' + evt.event + '(' + evt.eventid + ')');
  var actions = checkEvent(evt);
  for(var i = 0; i < actions.length; i++) {
    invokeAction(evt, actions[i]);
  }
}

/**
 * Check an event against the rules repository and return the actions
 * if the conditons are met.
 * @param {Object} evt the event to check
 */
function checkEvent(evt) {
  var actions = [];
  for(var rn in listRules) {
    //TODO this needs to get depth safe, not only data but eventually also
    // on one level above (eventid and other meta)
    if(listRules[rn].event === evt.event && validConditions(evt.data, listRules[rn])) {
      console.log(' | EN | Rule "' + rn + '" fired');
      actions = actions.concat(listRules[rn].actions);
    }
  }
  return actions;
}

/**
 * Checks whether all conditions of the rule are met by the event.
 * @param {Object} evt the event to check
 * @param {Object} rule the rule with its conditions
 */
function validConditions(evt, rule) {
  for(var property in rule.condition){
    if(!evt[property] || evt[property] != rule.condition[property]) return false;
  }
  return true;
}

/**
 * Invoke an action according to its type.
 * @param {Object} evt The event that invoked the action
 * @param {Object} action The action to be invoked
 */
function invokeAction(evt, action) {
  var actionargs = {},
      arrModule = action.module.split('->');
  if(arrModule.length < 2) {
    console.error(' | EN | Invalid rule detected!');
    return;
  }
  var srvc = listActionModules[arrModule[0]];
  if(srvc && srvc[arrModule[1]]) {
    //FIXME preprocessing not only on data
    preprocessActionArguments(evt.data, action.arguments, actionargs);
    try {
      if(srvc[arrModule[1]]) srvc[arrModule[1]](actionargs);
    } catch(err) {
      console.error(' | EN | ERROR during action execution: ' + err);
    }
  }
  else console.log(' | EN | No api interface found for: ' + action.module);
}

/**
 * Action properties may contain event properties which need to be resolved beforehand.
 * @param {Object} evt The event whose property values can be used in the rules action
 * @param {Object} act The rules action arguments
 * @param {Object} res The object to be used to enter the new properties
 */
function preprocessActionArguments(evt, act, res) {
  for(var prop in act) {
    /*
     * If the property is an object itself we go into recursion
     */
    if(typeof act[prop] === 'object') {
      res[prop] = {};
      preprocessActionArguments(evt, act[prop], res[prop]);
    }
    else {
      var txt = act[prop];
      var arr = txt.match(regex);
      /*
       * If rules action property holds event properties we resolve them and
       * replace the original action property
       */
      // console.log(evt);
      if(arr) {
        for(var i = 0; i < arr.length; i++) {
          /*
           * The first three characters are '$X.', followed by the property
           */
          var actionProp = arr[i].substring(3).toLowerCase();
          // console.log(actionProp);
          for(var eprop in evt) {
            // our rules language doesn't care about upper or lower case
            if(eprop.toLowerCase() === actionProp) {
              txt = txt.replace(arr[i], evt[eprop]);
            }
          }
          txt = txt.replace(arr[i], '[property not available]');
        }
      }
      res[prop] = txt;
    }
  }
}

function loadEventModule(args, aS, aE) {
  if(args && args.name) {
  	aS('Loading event module ' + args.name);
  	poller.send('cmd|loadevent|'+args.name);
  } if(args) aE(args.name + ' not found');
}

function loadEventModules(args, aS, aE) {
	aS('Loading event moules...');
  poller.send('cmd|loadevents');
}

function shutDown() {
  console.log(' | EN | Shutting down Poller and DB Link');
  isRunning = false;
  poller.send('cmd|shutdown');
  db.shutDown();
}

exports.init = init;
exports.loadActionModule = loadActionModule;
exports.loadRule = loadRule;
exports.loadEventModule = loadEventModule;
exports.loadEventModules = loadEventModules;
exports.pushEvent = pushEvent;
exports.shutDown = shutDown;
