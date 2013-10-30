'use strict';

if(process.argv.length < 3) {
  console.log('ERROR: No DB port defined! Not starting poller...');
  return;
}

var fs = require('fs'),
  path = require('path'),
  db = require('./db_interface'),
  lm = require('./load_modules'),
  listMessageActions = {},
  listEventModules = {},
  listPoll = {},  //TODO this will change in the future because it could have
                  //several parameterized (user-specific) instances of each event module 
  eId = 0;
//TODO allow different polling intervals (a wrapper together with settimeout per to be polled could be an easy and solution)

db.init(process.argv[2]);

db.getEventModules(function(err, obj) {
  if(err) console.error(' | EP | ERROR retrieving Event Modules from DB!');
  else {
    if(!obj) {
      console.log(' | EP | No Event Modules found in DB!');
      process.send({ event: 'ep_finished_loading' });
    } else {
      var m, semaphore = 0;
      for(var el in obj) {
        semaphore++;
        m = lm.compile(obj[el], el);
        db.getEventModuleAuth(el, function(mod) {
          return function(err, obj) {
            if(--semaphore === 0) process.send({ event: 'ep_finished_loading' });
            if(obj && mod.loadCredentials) mod.loadCredentials(JSON.parse(obj));
          };
        }(m));
        listEventModules[el] = m;
      }
    }
  }
});

listMessageActions['event'] = function(args) {
  var prop = args[1], arrModule = prop.split('->');
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
};

function loadEventCallback(name, data, mod, auth) {
  db.storeEventModule(name, data); // store module in db
  if(auth) db.storeEventModuleAuth(name, auth);
  listEventModules[name] = mod; // store compiled module for polling
}

listMessageActions['cmd'] = function(args) {
  switch(args[1]) {
    case 'loadevent':
      lm.loadModule('event_modules', args[2], loadEventCallback);
      break;
    case 'loadevents':
      lm.loadModules('event_modules', loadEventCallback);
      break;
  }
};

process.on('message', function(strProps) {
  var arrProps = strProps.split('|');
  if(arrProps.length < 2) console.error(' | EP | ERROR: too few parameter in message!');
  else {
    var func = listMessageActions[arrProps[0]];
    if(func) func(arrProps);
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

pollLoop();
