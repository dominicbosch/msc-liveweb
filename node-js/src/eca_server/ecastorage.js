'use strict';
var listRules = [];

/**
 * Insert a rule into the eca rules repository
 * @param {Object} rule the rule object
 */
function insertRule(rule) {
  //TODO validate rule
  listRules.push(rule);
}

/**
 * Check an event against the rules repository and return the actions
 * if the conditons are met.
 * @param {Object} evt the event to check
 */
function checkEvent(evt) {
  var actions = [];
  for(var i = 0; i < listRules.length; i++) {
    if(checkConditions(evt, listRules[i])) {
      actions = actions.concat(listRules[i].actions);
    }
  }
  return actions;
}

function checkConditions(evt, rule) {
  for(var property in rule.condition){
    if(!evt[property] || evt[property] != rule.condition[property]) return false;
  }
  return true;
}

exports.insertRule = insertRule;
exports.checkEvent = checkEvent;