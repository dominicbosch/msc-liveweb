var fs = require('fs'),
  funcLoadApi, funcLoadRule;

/**
 * @param funcApi the function this class pushes its apis to
 * @param funcPush the function this class pushes its rules to
 */
function init(funcApi, funcPush) {
  funcLoadApi = funcApi;
  funcLoadRule = funcPush;
  loadApiFile('probinder');
  loadRulesFile('rules');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', processUserInput);
  // Ctrl + D would end the process
  process.stdin.on('end', function() { console.log('user kills me o.O'); });
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function processUserInput(chunk) {
  var arr = chunk.replace(/\n/g, "").split(' ');
  if(arr.length < 2) {
    console.log('Too few arguments!');
    return;
  }
  switch(arr[0]) {
    case 'loadrule':
      loadRulesFile(arr[1]);
      break;
    case 'loadapi':
      loadApiFile(arr[1]);
      break;
    default: console.log('action (' + arr[0] + ') unknown! Known actions are: loadrule, loadapi');
  }
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadApiFile(name) {
  funcLoadApi(name, require('./apis/' + name + '/' + name + '.js'));
  console.log('API ' + name + ' loaded');
}

function loadRulesFile(name) {
  if(!funcLoadRule) console.trace('ERROR: no rule loader function available');
  // fs.readFile(__dirname + '/' + name + '.json', 'utf8', function (err, data) {
  fs.readFile(name + '.json', 'utf8', function (err, data) {
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
