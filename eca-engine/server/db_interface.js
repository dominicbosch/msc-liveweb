'use strict';

var redis = require("redis"), db;

/**
 * Initializes the DB connection.
 * @param {int} db_port the port where the DB listens to requests
 */
function init(db_port, cbDone){
  if(!db_port) {
    console.error(' | DB | ERROR: No DB port defined!');
    return;
  }
  db = redis.createClient(db_port);
  db.on("error", function (err) {
    console.error(" | DB | Received error message from DB: " + err);
  });
  if(cbDone) cbDone();
}

/**
 * Abstraction answer handling for simple information replies from the DB. 
 * @param {String} action the action to be displayed in the output string.
 */
function replyHandler(action) {
  return function(err, reply) {
    if(err) console.error(' | DB | ERROR during "' + action + '": ' + err);
    else console.log(' | DB | ' + action + ': ' + reply);
  };
}

/**
 * The general structure for modules is that the key is stored in a set.
 * By fetching all set entries we can then fetch all modules, which is
 * automated in this function.
 * 
 * @param {String} set the set name how it is stored in the DB
 * @param {function} funcSingle the function that fetches single entries from the DB
 * @param {function} callback the function to be called on success or error, receives
 *                    arguments (err, obj)
 */
function getSetRecords(set, funcSingle, callback) {
  db.smembers(set, function(err, reply) {
    if(err) console.error(' | DB | ERROR fetching ' + set + ': ' + err);
    else {
      if(reply.length === 0) {
        callback(null, null);
      } else {
        var semaphor = reply.length, objReplies = {};
        setTimeout(function() {
          if(semaphor > 0) {
            callback('Timeout fetching ' + set, null);
          }
        }, 1000);
        for(var i = 0; i < reply.length; i++){
          funcSingle(reply[i], function(prop) {
            return function(err, reply) {
              if(err) console.error(' | DB | Error fetching single element: ' + prop);
              else {
                objReplies[prop] = reply;
                if(--semaphor === 0) callback(null, objReplies);
              }
            };
          }(reply[i]));
        }
      }
    }
  });
}

/**
 * Store a string representation of an action module in the DB.
 * @param {String} id the unique identifier of the module
 * @param {String} data the string representation
 */
function storeActionModule(id, data) {
  db.sadd('action_modules', id, replyHandler('storing action module key ' + id));
  db.set('action_module_' + id, data, replyHandler('storing action module ' + id));
}

/**
 * Query the DB for an action module.
 * @param {String} id the module id
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getActionModule(id, callback) {
  db.get('action_module_' + id, callback);
}

/**
 * Fetch all action modules.
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getActionModules(callback) {
  getSetRecords('action_modules', getActionModule, callback);
}

/**
 * 
 * Store a string representation of the authentication parameters for an action module.
 * @param {String} id the unique identifier of the module
 * @param {String} data the string representation
 */
function storeActionModuleAuth(id, data) {
  db.sadd('action_modules_auth', id, replyHandler('storing action module auth key ' + id));
  db.set('action_module_' + id +'_auth', data, replyHandler('storing action module auth ' + id));
}

/**
 * Query the DB for an action module authentication token.
 * @param {String} id the module id
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getActionModuleAuth(id, callback) {
  db.get('action_module_' + id + '_auth', callback);
}

/**
 * Store a string representation of an event module in the DB.
 * @param {String} id the unique identifier of the module
 * @param {String} data the string representation
 */
function storeEventModule(id, data) {
  db.sadd('event_modules', id, replyHandler('storing event module key ' + id));
  db.set('event_module_' + id, data, replyHandler('storing event module ' + id));
}

/**
 * Query the DB for an event module.
 * @param {String} id the module id
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getEventModule(id, callback) {
  db.get('event_module_' + id, callback);
}

/**
 * Fetch all event modules.
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getEventModules(callback) {
  getSetRecords('event_modules', getEventModule, callback);
}

/**
 * Store a string representation of he authentication parameters for an event module.
 * @param {String} id the unique identifier of the module
 * @param {String} data the string representation
 */
function storeEventModuleAuth(id, data) {
  db.sadd('event_modules_auth', id, replyHandler('storing event module auth key ' + id));
  db.set('event_module_' + id +'_auth', data, replyHandler('storing event module auth ' + id));
}

/**
 * Query the DB for an event module authentication token.
 * @param {String} id the module id
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getEventModuleAuth(id, callback) {
  db.get('event_module_' + id +'_auth', callback);
}

/**
 * Store a string representation of a rule in the DB.
 * @param {String} id the unique identifier of the rule
 * @param {String} data the string representation
 */
function storeRule(id, data) {
  db.sadd('rules', id, replyHandler('storing rule key ' + id));
  db.set('rules_' + id, data, replyHandler('storing rule ' + id));
}

/**
 * Query the DB for a rule.
 * @param {String} id the rule id
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getRule(id, callback) {
  // db.get('rule_' + id, function(err, obj) {
    // console.log(err);
    // console.log(obj);
  // });
  db.get('rule_' + id, callback);
}

/**
 * Fetch all rules.
 * @param {function} callback the callback to receive the answer (err, obj)
 */
function getRules(callback) {
  getSetRecords('rules', getRule, callback);
}

exports.init = init;

exports.storeActionModule = storeActionModule;
exports.getActionModule = getActionModule;
exports.getActionModules = getActionModules;
exports.storeActionModuleAuth = storeActionModuleAuth;
exports.getActionModuleAuth = getActionModuleAuth;

exports.storeEventModule = storeEventModule;
exports.getEventModule = getEventModule;
exports.getEventModules = getEventModules;
exports.storeEventModuleAuth = storeEventModuleAuth;
exports.getEventModuleAuth = getEventModuleAuth;

exports.storeRule = storeRule;
exports.getRule = getRule;
exports.getRules = getRules;
