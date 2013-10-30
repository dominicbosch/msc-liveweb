var fs = require('fs'),
  path = require('path'),
  needle = require('needle'),
  lm = require('./load_modules'),
  db = null,
  funcLoadAction, funcLoadRule;

// TODO func def 
function init(db_link, fLoadAction, fLoadRule) {
  db = db_link;
  funcLoadAction = function(name, data, mod) {
    db.storeActionModule(name, data); // store module in db
    fLoadAction(name, mod); // hand compiled module back
  };
  funcLoadRule = fLoadRule;
  lm.loadModules('action_modules', funcLoadAction);
  setTimeout(loadRulesFile, 500, 'rules'); // Event modules need to be ready before loading rules
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', processUserInput);
  // Ctrl + D would end the process
  process.stdin.on('end', function() { console.log('user kills me o.O'); });
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function processUserInput(chunk) {
  var arr = chunk.replace(/\n/g, "").split(' ');
  if(arr.length < 1) {
    console.error(' | ML | Too few arguments! Type (loadrules|loadaction) eventuall followed by a custom module name');
    return;
  }
  switch(arr[0]) {
    case 'loadrules':
      if(arr.length == 1) loadRulesFile('rules');
      else loadRulesFile(arr[1]);
      break;
    case 'loadaction':
      var name = 'probinder';
      if(arr.length > 1) name = arr[1];
      lm.loadModule(path.resolve(__dirname, 'action_modules'), name, funcLoadAction);
      break;
    default: console.log(' | ML | action (' + arr[0] + ') unknown! Known actions are: loadrules, loadaction');
  }
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadModule(directory, name, callback) {
  function requireFromString(src) {
    // YAH yet another hack, this time to load modules from strings
    var m = new module.constructor(path.resolve(directory, name, name + '.js'), module);
    m.paths = module.paths;
    m._compile(src);
    return m.exports;
  }
  try {
    fs.readFile(path.resolve(directory, name, name + '.js'), 'utf8', function (err, data) {
      if (err) {
        console.error(' | ML | ERROR: Loading module file!');
        return;
      }
      // store module in db
      db.storeActionModule(name, data);
      
      // compile module and hand it back
      callback(name, requireFromString(data));
    });
  } catch(err) {
    console.log('FAILED loading module "' + name + '"');
  }
}

function loadModules(directory, callback) {
  fs.readdir(path.resolve(__dirname, directory), function (err, list) {
    if (err) {
      console.error(' | ML | ERROR loading modules directory: ' + err);
      return;
    }
    console.log(' | ML | Loading ' + list.length + ' action modules');
    list.forEach(function (file) {
      fs.stat(path.resolve(__dirname, directory, file), function (err, stat) {
        if (stat && stat.isDirectory()) {
          loadModule(path.resolve(__dirname, directory), file, callback);
        }
      });
    });
  });
}

function loadRulesFile(name) {
  if(!funcLoadRule) console.error(' | ML | ERROR: no rule loader function available');
  fs.readFile(path.resolve(__dirname, 'rules', name + '.json'), 'utf8', function (err, data) {
    if (err) {
      console.error(' | ML | ERROR: Loading rules file: ' + name + '.json');
      return;
    }
    var arr = JSON.parse(data);
    console.log(' | ML | Loading ' + arr.length + ' rules:');
    for(var i = 0; i < arr.length; i++) {
      db.storeRule(arr[i].id,JSON.stringify(arr[i]));
      funcLoadRule(arr[i]);
    }
  });
}

exports.init = init;