'use strict';

var fs = require('fs'),
  path = require('path'),
  listEventModules = {},
  listPoll = {},  //TODO this will change in the future because it could have
                  //several parameterized (user-specific) instances of each event module 
  eId = 0;
//TODO allow different polling intervals (a wrapper together with settimeout per to be polled could be an easy and solution)

process.on('message', function(prop) {
  var arrModule = prop.split('->');
  if(arrModule.length > 1){
    var module = listEventModules[arrModule[0]];
    for(var i = 1; i < arrModule.length; i++) {
      if(module) module = module[arrModule[i]];
    }
    if(module) {
      console.log('Found property "' + prop + '", adding it to polling list');
      listPoll[prop] = module;
    } else {
      console.log('No property "' + prop + '" found');
    }
  }
});

function loadModules(directory) {
  fs.readdir(path.resolve(__dirname, directory), function (err, list) {
    if (err) {
      console.trace(err);
      return;
    }
    list.forEach(function (file) {
      fs.stat(path.resolve(__dirname, directory, file), function (err, stat) {
        if (stat && stat.isDirectory()) {
          listEventModules[file] = require(path.resolve(directory, file, file + '.js'));
          console.log('Event module "' + file + '" loaded');
        }
      });
    });
  });
}

function checkRemotes() {
  for(var prop in listPoll) {
    listPoll[prop](function(obj) { 
      process.send({
        event: prop,
        eventid: 'polled_' + eId++,
        data: obj
      });
    });
  }
}

function pollLoop() {
  checkRemotes();
  setTimeout(pollLoop, 10000);
}
loadModules('event_modules');
pollLoop();
