'use strict';

var redis = require("redis"), db;
    
function init(db_port){
  if(!db_port) {
    console.error(' | DB | ERROR: No DB port defined!');
    return;
  }
  db = redis.createClient(db_port);
  db.on("error", function (err) {
      console.error(" | DB | Received error message from DB: " + err);
  });
};

/**
 * 
 * @param {String} id
 * @param {String} data
 */
function storeActionModule(id, data) {
  var oMod = {};
  oMod[id] = data;
  db.hmset("action_modules", oMod, function(err, reply) {
      console.log(' | DB | Action module "' + id + '" stored: ' + reply);
  });
}

/**
 * 
 * @param {String} id
 * @param {String} data
 */
function storeActionModuleAuth(id, data) {
  var oMod = {};
  oMod[id] = data;
  db.hmset("action_modules_auth", oMod, function(err, reply) {
      console.log(' | DB | Action module auth "' + id + '" stored: ' + reply);
  });
}

/**
 * @param {String} id
 */
function getActionModule(id) {
  
}

/**
 * 
 */
function getActionModules() {
  db.hgetall("action_modules", function(err, reply) {
    console.log('action modules:');
    console.log(reply);
  });
}

/**
 * 
 * @param {String} id
 * @param {String} data
 */
function storeEventModule(id, data) {
  var oMod = {};
  oMod[id] = data;
  db.hmset("event_modules", oMod, function(err, reply) {
      console.log(' | DB | Event module "' + id + '" stored: ' + reply);
  });
}

function getEventModules() {
  db.hgetall("event_modules", function(err, reply) {
    console.log('event  modules:');
    console.log(reply);
  });
}


/**
 * 
 * @param {String} id
 * @param {String} data
 */
function storeRule(id, data) {
  var oMod = {};
  oMod[id] = data;
  db.hmset("rules", oMod, function(err, reply) {
      console.log(' | DB | Rule "' + id + '" stored: ' + reply);
  });
}

/**
 * 
 * @param {String} id
 */
function getRule(id) {
  
}
/**
 * 
 */
function getRules() {
  db.hgetall("rules", function(err, reply) {
    console.log('rules:');
    console.log(reply);
  });
}

exports.init = init;
exports.storeActionModule = storeActionModule;
exports.storeActionModuleAuth = storeActionModuleAuth;
exports.getActionModules = getActionModules;
exports.storeEventModule = storeEventModule;
exports.getEventModules = getEventModules;
exports.storeRule = storeRule;
exports.getRules = getRules;
