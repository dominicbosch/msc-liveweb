exports.print = function(module, msg) {
  console.log(' | ' + module + ' | ' + msg);
};

exports.error = function(module, msg) {
  console.error(' | ' + module + ' | ERROR: ' + msg);
};
