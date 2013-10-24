var fs = require('fs'),
  path = require('path'),
  funcLoadAction, funcLoadRule;

/**
 * @param funcApi the function this class pushes its apis to
 * @param funcRule the function this class pushes its rules to
 */
function init(funcAction, funcRule) {
  funcLoadAction = funcAction;
  funcLoadRule = funcRule;
  loadModules('action_modules', funcLoadAction);
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
    console.log('Too few arguments! Type (loadrules|loadaction) eventuall followed by a custom module name');
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
      loadModule(path.resolve(__dirname, 'action_modules'), name, funcLoadAction);
      break;
    default: console.log('action (' + arr[0] + ') unknown! Known actions are: loadrules, loadaction');
  }
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadModule(directory, name, callback) {
  try {
    var mod = require(path.resolve(directory, name, name + '.js'));
    if(mod) {
      if(fs.existsSync(path.resolve(directory, name, 'credentials.json'))) {
        fs.readFile(path.resolve(directory, name, 'credentials.json'), 'utf8', function (err, data) {
          if (err) {
            console.trace('ERROR: Loading credentials file!');
            return;
          }
          if(mod.loadCredentials) mod.loadCredentials(JSON.parse(data));
        });
      }
      callback(name, mod);
    }
  } catch(err) {
    console.log('FAILED loading module "' + name + '"');
  }
}

function loadModules(directory, callback) {
  fs.readdir(path.resolve(__dirname, directory), function (err, list) {
    if (err) {
      console.trace(err);
      return;
    }
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
  if(!funcLoadRule) console.trace('ERROR: no rule loader function available');
  fs.readFile(path.resolve(__dirname, 'rules', name + '.json'), 'utf8', function (err, data) {
    if (err) {
      console.trace('ERROR: Loading rules file: ' + name + '.json');
      return;
    }
    var arr = JSON.parse(data);
    console.log('Adding ' + arr.length + ' rules');
    for(var i = 0; i < arr.length; i++) funcLoadRule(arr[i]);
  });
}

exports.init = init;