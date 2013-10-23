'use strict';
var ml = require('./moduleloader'),
  cp = require('child_process'),
  poller = cp.fork('./eventpoller'),
  qEvents = new (require('./queue')).Queue();

poller.on('message', function(evt) {
  pushEvent(evt);
});

var regex = /\$X\.[\w\.\[\]]*/g, // find properties of $X
// var regex = /\$X\.([0-9A-z\.\[\]])*[A-z]/g, // find properties of $X
  listRules = {},
  listActionModules = {};

/**
 * Initialize the rules engine which initializes the module loader.
 */
function init() {
  ml.init(loadActionModule, insertRule);
  setTimeout(queryQueue, 1000); // wait a bit for everything to init
}

/**
 * Insert an action module into the list of available interfaces.
 * @param {Object} objModule the action module object
 */
function loadActionModule(name, objModule) {
  console.log('Action module "' + name + '" loaded');
  listActionModules[name] = objModule;
}

/**
 * Insert a rule into the eca rules repository
 * @param {Object} objRule the rule object
 */
function insertRule(objRule) {
  //TODO validate rule
  if(listRules[objRule.id]) console.log('Replacing rule: ' + objRule.id);
  listRules[objRule.id] = objRule;
  
  // Notify poller about eventual candidate
  poller.send(objRule.event);
}

function queryQueue() {
  var evt = qEvents.dequeue();
  if(evt) {
    processRequest(evt);
  }
  setTimeout(queryQueue, 50); //TODO adapt to load
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
function processRequest(evt) {
  console.log('processing event: ' + evt.event + '(' + evt.eventid + ')');
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
      console.log('Engine> Rule "' + rn + '" fired');
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
  var actionargs = {};
  var srvc = listActionModules[action.apiprovider];
  if(srvc) {
    //FIXME preprocessing not only on data
    preprocessActionArguments(evt.data, action.arguments, actionargs);
    if(srvc[action.method]) srvc[action.method](actionargs);
  }
  else console.log('no api interface found for: ' + action.apiprovider);
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

init();

exports.insertRule = insertRule;
exports.pushEvent = pushEvent;