// # Logging
// Functions to funnel logging

// @function print(module, msg)

// Prints a log to stdout.
// @param {String} module
// @param {String} msg
exports.print = function(module, msg) {
  console.log(' | ' + module + ' | ' + msg);
};

// @function error(module, msg)

// Prints a log to stderr.
// @param {String} module
// @param {String} msg
exports.error = function(module, msg) {
  console.error(' | ' + module + ' | ERROR: ' + msg);
};
