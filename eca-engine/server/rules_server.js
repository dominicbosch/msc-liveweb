'use strict';

var express = require('express'),
  http_listener = require('./http_listener'),
  db = require('./db_interface'),
  engine = require('./engine'),
  ml = require('./moduleloader'),
  fs = require('fs'),
  path = require('path');

fs.readFile(path.resolve(__dirname, 'config', 'config.json'), 'utf8', function (err, data) {
  if (err) {
    console.error(' | SV | ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  if(!config.http_port || !config.db_port) {
    console.log(' | SV | ERROR: you forgot to define either http_port or db_port, or even both!');
  } else {
    engine.init(config.db_port);
    http_listener.init(config.http_port, engine.pushEvent);
    db.init(config.db_port);
    ml.init(db, engine.loadActionModule, engine.loadRule);
    //TODO everybody wait for the moduleloader to finish

    db.getActionModules();
    db.getEventModules();
    db.getRules();
  }
});