var fs = require('fs'),
  path = require('path'),
  lm = require('./load_modules'),
  db = null,
  funcLoadAction, funcLoadRule;

function init(db_link, fLoadAction, fLoadRule) {
  db = db_link;
  funcLoadAction = fLoadAction;
  funcLoadRule = fLoadRule;
  // setTimeout(loadRulesFile, 500, 'rules'); // Event modules need to be ready before loading rules
  // process.stdin.resume();
  // process.stdin.setEncoding('utf8');
  // process.stdin.on('data', processUserInput);
  // // Ctrl + D would end the process
  // process.stdin.on('end', function() { console.log('user kills me o.O'); });
  // setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

// function processUserInput(chunk) {
  // var arr = chunk.replace(/\n/g, "").split(' ');
  // if(arr.length < 1) {
    // console.error(' | ML | Too few arguments! Type (loadrules|loadaction) eventuall followed by a custom module name');
    // return;
  // }
  // switch(arr[0]) {
    // case 'loadrules':
      // if(arr.length == 1) loadRulesFile('rules');
      // else loadRulesFile(arr[1]);
      // break;
    // case 'loadaction':
      // var name = 'probinder';
      // if(arr.length > 1) name = arr[1];
      // lm.loadModule(path.resolve(__dirname, 'action_modules'), name, funcLoadAction);
      // break;
    // default: console.log(' | ML | action (' + arr[0] + ') unknown! Known actions are: loadrules, loadaction');
  // }
  // setTimeout(function() { console.log('What would you like to do?'); }, 1000);
// }

function loadRulesFile(args) {
  if(!args) args = {};
  if(!args.name) args.name = 'rules';
  if(!funcLoadRule) console.error(' | ML | ERROR: no rule loader function available');
  else {
    fs.readFile(path.resolve(__dirname, 'rules', args.name + '.json'), 'utf8', function (err, data) {
      if (err) {
        console.error(' | ML | ERROR: Loading rules file: ' + args.name + '.json');
        return;
      }
      var arr = JSON.parse(data);
      console.log(' | ML | Loading ' + arr.length + ' rules:');
      for(var i = 0; i < arr.length; i++) {
        db.storeRule(arr[i].id, JSON.stringify(arr[i]));
        funcLoadRule(arr[i]);
      }
    });
  }
}

function loadActionCallback(name, data, mod, auth) {
  db.storeActionModule(name, data); // store module in db
  funcLoadAction(name, mod); // hand compiled module back
  if(auth) db.storeActionModuleAuth(name, auth);
}

function loadActionModule(args) {
  if(args && args.name) {
    lm.loadModule('action_modules', args.name, loadActionCallback);
  }
}

function loadActionModules() {
  lm.loadModules('action_modules', loadActionCallback);
}

exports.init = init;
exports.loadRulesFile = loadRulesFile;
exports.loadActionModule = loadActionModule;
exports.loadActionModules = loadActionModules;
