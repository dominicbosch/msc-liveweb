var fs = require('fs'),
  oe = require('./other-example');

exports.loadFile = function( path ) {
  oe.inform( path );
  try {
    return JSON.parse( fs.readFileSync( path ) );
  } catch (e) { /* [Error Handler] */ }
}
