'use strict';

var express = require('express'),
  http_listener = require('./http_listener'),
  db = require('./db_interface'),
  engine = require('./engine'),
  ml = require('./moduleloader'),
  fs = require('fs'),
  path = require('path');
  
function handleAdminCommands(args) {
  //TODO replace ugly switch with an object
  switch(args.cmd) {
    case 'loadrules':
      ml.loadRulesFile(args);
      break;
    case 'loadaction':
      ml.loadActionModule(args);
      break;
    case 'loadactions':
      ml.loadActionModules();
      break;
    case 'loadevent':
      engine.loadEventModule(args);
      break;
    case 'loadevents':
      engine.loadEventModules();
      break;
    default: 
      console.log('unknown command');
  }
}

fs.readFile(path.resolve(__dirname, 'config', 'config.json'), 'utf8', function (err, data) {
  if (err) {
    console.error(' | RS | ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  if(!config.http_port || !config.db_port) {
    console.error(' | RS | ERROR: you forgot to define either http_port or db_port, or even both!');
  } else {
    console.log(' | RS | Initialzing DB');
    db.init(config.db_port, function() {
      engine.init(db, config.db_port);
    });
    console.log(' | RS | Initialzing http listener');
    http_listener.init(config.http_port, handleAdminCommands, engine.pushEvent);
    console.log(' | RS | Initialzing module loader');
    ml.init(db, engine.loadActionModule, engine.loadRule);
  }
});