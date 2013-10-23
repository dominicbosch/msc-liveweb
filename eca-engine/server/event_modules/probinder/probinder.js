'use strict';

/*
 * ProBinder EVENT MODULE
 */

var request = require('needle'),
  fs = require('fs'),
  urlService = 'https://probinder.com/service/',
  credentials = null;

/**
 * Takes the actions to make this module ready when it is loaded
 */
function init() {
  fs.readFile(__dirname + '/credentials.json', 'utf8', function (err, data) {
    if (err) {
      console.trace('ERROR: Loading credentials file! Did you create it already?');
      return;
    }
    credentials = JSON.parse(data);
    if(!credentials || !credentials.username || !credentials.password) {
      credentials = null;
      console.trace('ERROR: credentials file corrupt');
    }
  });
}

/**
 * Call the ProBinder service with the given parameters.
 * @param {Object} args the required function arguments object
 * @param {Object} [args.data] the data to be posted
 * @param {String} args.service the required service identifier to be appended to the url
 * @param {String} args.method the required method identifier to be appended to the url
 * @param {function} [args.succes] the function to be called on success,
 *    receives the response body String or Buffer.
 * @param {function} [args.error] the function to be called on error,
 *    receives an error, an http.ClientResponse object and a response body
 *    String or Buffer.
 */
function call(args) {
  if(!args || !args.service || !args.method) {
    console.trace('ERROR: Too few arguments!');
    return;
  }
	if(request && credentials){
    request.post(urlService + args.service + '/' + args.method,
      args.data,
      credentials,
      function(error, response, body) { // The callback
        if (!error) { //) && response.statusCode == 200) {
          if(args && args.success) args.success(body);
        } else {
          if(args && args.error) args.error(error, response, body);
          else console.trace('Error during serivce call: ' + error.message);
        }
      }
    );
	} else console.trace('request or credentials object not ready!');
};

/**
 * Calls the user's unread content service.
 * @param {Object} [args] the optional object containing the success
 *    and error callback methods
 */
function unread(callback) {
  call({
    service: '36',
    method: 'unreadcontent',
    success: function(data) {
      for(var i = 0; i < data.length; i++) callback(data[i]);
    }
  });
  
};

init();

exports.call = call;
exports.unread = unread;
  
