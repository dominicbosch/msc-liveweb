'use strict';
  
var request = require('needle');

/**
 * Call any arbitrary webAPI.
 * @param {Object} args the required function arguments object
 * @param {String} args.url the required webAPI url
 * @param {Object} [args.data] the data to be posted
 * @param {Object} [args.credentials] optional credentials
 * @param {String} [args.credentials.username] optional username
 * @param {String} [args.credentials.password] optional password
 */
function call(args) {
  if(!args || !args.url) {
    console.trace('ERROR: Too few arguments!');
    return;
  }
  if(request){
    request.post(args.url,
      args.data,
      args.credentials,
      function(error, response, body) {
        if (!error) console.log('Successful webAPI call to ' + args.url);
        else console.trace('Error during webAPI call to ' + args.url
           + ': ' + error.message);
      }
    );
  } else console.trace('request object not ready!');
};

exports.call = call;
  
