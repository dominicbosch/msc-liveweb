'use strict';
/*
 * Load the bidirectional event server instance
 */
var regex = /\$X\.([A-z]|\.)*[A-z]/g; // find properties of $X
var listRules = [];
var apiinterfaces = {};

/**
 * Initialize the rules engine.
 */
function init() {
  apiinterfaces.probinder = require(__dirname + '/apis/probinder/probinder');
}

/**
 * Insert a rule into the eca rules repository
 * @param {Object} rule the rule object
 */
function insertRule(rule) {
  //TODO validate rule
  listRules.push(rule);
}

/**
 * Handles correctly posted events
 * @param {Object} evt The event object
 */
function processRequest(evt) {
  console.log('received event: ');
  console.log(evt);
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
  for(var i = 0; i < listRules.length; i++) {
    if(validConditions(evt, listRules[i])) {
      actions = actions.concat(listRules[i].actions);
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
 * @param {Object} action The action to be onvoked
 */
function invokeAction(evt, action) {
  var actionargs = {};
  preprocessActionArguments(evt, action.arguments, actionargs);
  switch(action.type) {
    case 'servicecall':
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
  for(var prop in act) {
    /*
     * If the property is an object itself we go into recursion
     */
    if(typeof act[prop] === 'object') {
      res[prop] = {};
      preprocessActionArguments(evt, act[prop], res[prop]);
    }
    else {
      var arr = act[prop].match(regex);
      /*
       * If rules action property holds event properties we resolve them and
       * replace the original action property
       */
      if(arr) {
        var txt = act[prop];
        for(var i = 0; i < arr.length; i++) {
          /*
           * The first three characters are '$X.', followed by the property
           */
          txt = txt.replace(arr[i], evt[arr[i].substring(3)]);
        }
        res[prop] = txt;
      }
    }
  }
}

init();

exports.insertRule = insertRule;
exports.processRequest = processRequest;