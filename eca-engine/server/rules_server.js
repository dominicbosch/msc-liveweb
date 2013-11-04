'use strict';

var http_listener = require('./http_listener'),
  db = require('./db_interface'),
  engine = require('./engine'),
  mm = require('./module_manager'),
  fs = require('fs'),
  path = require('path'),
  objCmds = {
    'loadrules': mm.loadRulesFile,
    'loadaction': mm.loadActionModule,
    'loadactions':  mm.loadActionModules,
    'loadevent': engine.loadEventModule,
    'loadevents': engine.loadEventModules,
    'shutdown': shutDown,
    'restart': null   //TODO implement
  };
  
function handleAdminCommands(args, answSuccess, answError) {
  if(args && args.cmd) {
    var func = objCmds[args.cmd];
    if(func) func(args, answSuccess, answError);
  } else console.log(' | RS | No command in request');
}

function shutDown(args, answSuccess, answError) {
	answSuccess('Goodbye!');
  console.log(' | RS | Received shut down command');
  engine.shutDown();
  http_listener.shutDown();
}

fs.readFile(path.resolve(__dirname, 'config', 'config.json'), 'utf8', function (err, data) {
  if (err) {
    console.error(' | RS | ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  if(!config.http_port || !config.db_port || !config.crypto_key) {
    console.error(' | RS | ERROR: you forgot to define either http_port, db_port, crypto_key, or even all of them!');
  } else {
    console.log(' | RS | Initialzing DB');
    db.init(config.db_port, config.crypto_key, function() {
      engine.init(db, config.db_port, config.crypto_key);
    });
    console.log(' | RS | Initialzing http listener');
    http_listener.init(config.http_port, handleAdminCommands, engine.pushEvent);
    console.log(' | RS | Initialzing module manager');
    mm.init(db, engine.loadActionModule, engine.loadRule);
  }
});