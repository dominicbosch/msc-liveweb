'use strict';

if(process.argv.length < 3) {
  console.log('ERROR: No DB port defined! Not starting poller...');
  return;
}

var fs = require('fs'),
  path = require('path'),
  db = require('./db_interface'),
  lm = require('./load_modules'),
  listEventModules = {},
  listPoll = {},  //TODO this will change in the future because it could have
                  //several parameterized (user-specific) instances of each event module 
  eId = 0;
//TODO allow different polling intervals (a wrapper together with settimeout per to be polled could be an easy and solution)

db.init(process.argv[2]);

process.on('message', function(prop) {
  var arrModule = prop.split('->');
  // var arrModule = obj.module.split('->');
  if(arrModule.length > 1){
    var module = listEventModules[arrModule[0]];
    for(var i = 1; i < arrModule.length; i++) {
      if(module) module = module[arrModule[i]];
    }
    if(module) {
      console.log(' | EP | Found property "' + prop + '", adding it to polling list');
      listPoll[prop] = module;
    } else {
      console.log(' | EP | No property "' + prop + '" found');
    }
  }
});

function checkRemotes() {
  // console.log('poller polls...');
  for(var prop in listPoll) {
    listPoll[prop](
    /*
     * what a hack to get prop local :-P
     * define and immediately call anonymous function with param prop.
     * This places the value of prop into the context of the callback
     * and thus doesn't change when the for loop keeps iterating over listPoll
     */
      (function(p) {
        return function(obj) {
          process.send({
            event: p,
            eventid: 'polled_' + eId++,
            data: obj
          });
        };
      })(prop)
    );
  }
}

function pollLoop() {
  checkRemotes();
  setTimeout(pollLoop, 10000);
}

lm.loadModules('event_modules', function(name, data, mod) {
  db.storeEventModule(name, data); // store module in db
  listEventModules[name] = mod; // store compiled module for polling
});

pollLoop();
