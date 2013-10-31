var fs = require('fs'),
  path = require('path'),
  ml = require('./module_loader'),
  db = null,
  funcLoadAction, funcLoadRule;

function init(db_link, fLoadAction, fLoadRule) {
  db = db_link;
  funcLoadAction = fLoadAction;
  funcLoadRule = fLoadRule;
}

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
    ml.loadModule('action_modules', args.name, loadActionCallback);
  }
}

function loadActionModules() {
  ml.loadModules('action_modules', loadActionCallback);
}

exports.init = init;
exports.loadRulesFile = loadRulesFile;
exports.loadActionModule = loadActionModule;
exports.loadActionModules = loadActionModules;