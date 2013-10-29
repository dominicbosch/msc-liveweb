'use strict';
var express = require('express'),
  http_listener = require('./http_listener'),
  db = require('./db_interface'),
  engine = require('./engine'),
  fs = require('fs'),
  path = require('path');


fs.readFile(path.resolve(__dirname, 'config', 'config.json'), 'utf8', function (err, data) {
  if (err) {
    console.trace('ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  if(!config.http_port || !config.db_port) {
    console.log('ERROR: you forgot to define either http_port or db_port, or even both!');
  } else {
    http_listener.init(config.http_port, engine.pushEvent);
    db.init(config.db_port);
  }
});
