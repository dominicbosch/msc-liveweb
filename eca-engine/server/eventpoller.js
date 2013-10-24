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

function loadModule(directory, name) {
  try {
    var mod = require(path.resolve(directory, name, name + '.js'));
    if(mod) {
      if(fs.existsSync(path.resolve(directory, name, 'credentials.json'))) {
        fs.readFile(path.resolve(directory, name, 'credentials.json'), 'utf8', function (err, data) {
          if (err) {
            console.trace('ERROR: Loading credentials file for "' + name + '"!');
            return;
          }
          if(mod.loadCredentials) mod.loadCredentials(JSON.parse(data));
        });
      }
      listEventModules[name] = mod;
    }
  } catch(err) {
    console.log('FAILED loading event module "' + name + '"');
  }
}

function loadModules(directory) {
  fs.readdir(path.resolve(__dirname, directory), function (err, list) {
    if (err) {
      console.trace(err);
      return;
    }
    list.forEach(function (file) {
      fs.stat(path.resolve(__dirname, directory, file), function (err, stat) {
        if (stat && stat.isDirectory()) {
          loadModule(path.resolve(__dirname, directory), file);
        }
      });
    });
  });
}

function checkRemotes() {
  for(var prop in listPoll) {
    listPoll[prop](prop, function(obj) {
      obj.eventid = 'polled_' + eId++;
      process.send(obj);
    });
  }
}

function pollLoop() {
  checkRemotes();
  setTimeout(pollLoop, 10000);
}
loadModules('event_modules');
pollLoop();
