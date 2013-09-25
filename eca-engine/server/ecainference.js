'use strict';
var ml = require('./moduleloader');
// var qEvents = new (require('./queue')).Queue();

var regex = /\$X\.[\w\.\[\]]*/g, // find properties of $X
// var regex = /\$X\.([0-9A-z\.\[\]])*[A-z]/g, // find properties of $X
  listRules = {},
  apiinterfaces = {};

/**
 * Initialize the rules engine which initializes the module loader.
 */
function init() {
  ml.init(loadApi, insertRule);
}

/**
 * Insert an api into the list of available interfaces.
 * @param {Object} objApi the api object
 */
function loadApi(apiname, objApi) {
  apiinterfaces[apiname] = objApi;
}

/**
 * Insert a rule into the eca rules repository
 * @param {Object} objRule the rule object
 */
function insertRule(objRule) {
  //TODO validate rule
  if(listRules[objRule.id]) console.log('Replacing rule: ' + objRule.id);
  listRules[objRule.id] = objRule;
}

/**
 * Stores correctly posted events
 * @param {Object} evt The event object
 */
function pushEvent(evt) {
  processRequest(evt);
  //TODO on higher loads we would want to fork a child process and assign it the task
  //of pulling events out of the inbound queue and process them while the main process
  // care of the retrieval of events from a remote host.
  // qEvents.enqueue(evt);
  // processRequest(qEvents.dequeue());
}

/**
 * Handles correctly posted events
 * @param {Object} evt The event object
 */
function processRequest(evt) {
  console.log('received event: ' + evt.event + '(' + evt.eventid + ')');
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
    if(listRules[rn].event === evt.event && validConditions(evt, listRules[rn])) {
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
  preprocessActionArguments(evt, action.arguments, actionargs);
  switch(action.type) {
    case 'webapicall':
      var srvc = apiinterfaces[action.apiprovider];
      if(srvc) {// The first three 
        srvc[action.method](actionargs);
      }
      else console.log('no api interface found for: ' + action.apiprovider);
      break;
    default: console.log('no action available for: ' + action.type);
  }
}

/**
 * Action properties may contain event properties which need to be resolved beforehand.
 * @param {Object} evt The event whose property values can be used in the rules action
 * @param {Object} act The rules action arguments
 * @param {Object} res The object to be used to enter the new properties
 */
function preprocessActionArguments(evt, act, res) {
  // function findPropRecursive(obj, depth) {
    // console.log('at ' + depth + ': ');
    // console.log(obj);
    // for(var p in obj) {
      // if(p.toLowerCase() === arrActionProp[depth]) {
        // console.log('found: ' + p);
        // if(depth + 1 == arrActionProp.length) {
          // return obj[p];
        // } else return findPropRecursive(obj[p], depth + 1);
      // }
    // }
  // }
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
      if(arr) {
        for(var i = 0; i < arr.length; i++) {
          /*
           * The first three characters are '$X.', followed by the property
           */
          var actionProp = arr[i].substring(3);
          // var arrActionProp = arr[i].substring(3).split('.');
          // var p = findPropRecursive(evt, 0);
          // console.log('finally found: ' + p + ' for ' + arr[i]);
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