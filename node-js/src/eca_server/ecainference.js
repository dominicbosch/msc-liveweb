'use strict';
var store = require('./ecastorage');
var regex = /\$X\.([A-z]|\.)*[A-z]/g; // find properties of $X

/**
 * Handles correctly posted events
 * @param {Object} evt The event object
 */
function processRequest(evt) {
  var actions = store.checkEvent(evt);
  for(var i = 0; i < actions.length; i++) {
    invokeAction(evt, actions[i]);
  }
}

function invokeAction(evt, action) {
  switch(action.type) {
    case 'servicecall':
      var srvc;
      switch(action.apiprovider) {
        case 'probinder':
          srvc = require('../probinder/probinder');
          break;
      }
      if(srvc) srvc[action.method](preprocessArguments(evt, action.arguments));
      else console.log('no api interface found for: ' + action.apiprovider);
      break;
    default: console.log('no action available for: ' + action.type);
  }
}

/**
 * 
 * @param {Object} evt
 * @param {Object} obj
 */
function preprocessArguments(evt, obj) {
  for(var prop in obj) {
    if(typeof obj[prop] === 'object') preprocessArguments(evt, obj[prop]);
    else {
      var arr = obj[prop].match(regex);
      if(arr) {
        var txt = obj[prop];
        for(var i = 0; i < arr.length; i++) {
          txt = txt.replace(arr[i], evt[arr[i].substring(3)]);
        }
        obj[prop] = txt;
      }
    }
  }
  return obj;
}

exports.processRequest = processRequest;
// allow direct access on storage to insert rules
exports.insertRule = store.insertRule; 