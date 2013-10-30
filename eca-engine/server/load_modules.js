var fs = require('fs'),
  path = require('path');
  
function loadModule(directory, name, callback) {
  //FIXME contextualize and only allow small set of modules for safety reasons
  function requireFromString(src) {
    // YAH yet another hack, this time to load modules from strings
    var id = path.resolve(directory, name, name + '.js');
    var m = new module.constructor(id, module);
    m.paths = module.paths;
    try {
      m._compile(src); 
    } catch(err) {
      console.error(' | LM | ERROR during compilation of ' + name + ': ' + err);
    }
    return m.exports;
  }
  try {
    fs.readFile(path.resolve(directory, name, name + '.js'), 'utf8', function (err, data) {
      if (err) {
        console.error(' | LM | ERROR: Loading module file!');
        return;
      }
      var mod = requireFromString(data);
      if(mod && fs.existsSync(path.resolve(directory, name, 'credentials.json'))) {
        fs.readFile(path.resolve(directory, name, 'credentials.json'), 'utf8', function (err, cred) {
          if (err) {
            console.error(' | LM | ERROR: Loading credentials file for "' + name + '"!');
            return;
          }
          if(mod.loadCredentials) mod.loadCredentials(JSON.parse(cred));
        });
      }
      // Hand back the name, the string contents and the compiled module
      callback(name, data, mod);
    });
  } catch(err) {
    console.error(' | LM | FAILED loading module "' + name + '"');
  }
}

function loadModules(directory, callback) {
  fs.readdir(path.resolve(__dirname, directory), function (err, list) {
    if (err) {
      console.error(' | LM | ERROR loading modules directory: ' + err);
      return;
    }
    console.log(' | LM | Loading ' + list.length + ' modules from "' + directory + '"');
    list.forEach(function (file) {
      fs.stat(path.resolve(__dirname, directory, file), function (err, stat) {
        if (stat && stat.isDirectory()) {
          loadModule(path.resolve(__dirname, directory), file, callback);
        }
      });
    });
  });
}

exports.loadModule = loadModule;
exports.loadModules = loadModules;

