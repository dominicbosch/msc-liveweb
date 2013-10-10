'use strict';
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
    if(credentials && credentials.username && credentials.password) {
      console.log('ProBinder interface successfully loaded credentials file');
    } else {
      credentials = null;
      console.trace('ERROR: credentials file corrupt');
    }
  });
}

/**
 * Reset eventually loaded credentials
 */
function purgeCredentials() {
  credentials = null;
};

/**
 * Verify whether the arguments match the existing credentials.
 * @param {String} username the username
 * @param {String} password the password
 */
function verifyCredentials(username, password) {
  if(!credentials) return false;
  return credentials.username === username
    && credentials.password === password;
};

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
 * @param {function} [args.succes] refer to call function
 * @param {function} [args.error] refer to call function
 */
function getUnreadContents(args) {
  if(!args) args = {};
  call({
    service: '36',
    method: 'unreadcontent',
    success: args.success,
    error: args.error
  });
};

/**
 * Calls the content service for a binder tab.
 * @param {Object} args the object containing the binder tab id, success
 *    and error callback methods
 * @param {String} tabid the binder tab id
 * @param {function} [args.succes] refer to call function
 * @param {function} [args.error] refer to call function
 */
function getBinderTabContents(args){
  if(!args || !args.tabid) {
    console.trace('ERROR: Too few arguments!');
    return;
  }
  call({
    service: '18',
    method: 'content',
    data: { id: args.tabid },
    success: args.success,
    error: args.error
  });
}
/**
 * Calls the content get service with the content id and the service id provided. 
 * @param {Object} args the object containing the service id and the content id,
 *    success and error callback methods
 * @param {String} args.serviceid the service id that is able to process this content
 * @param {String} args.contentid the content id
 * @param {function} [args.succes] to be called on success, receives the service, content
 *    and user id's along with the content
 * @param {function} [args.error] refer to call function
 */
function getContent(args){
  if(!args || !args.serviceid || !args.contentid) {
    console.trace('ERROR: Too few arguments!');
    return;
  }
  call({
    service: '2',
    method: 'get',
    data: { id: args.contentid, service: args.serviceid },
    success: args.success,
    error: args.error
  });
}

/**
 * Does everything to post something in a binder
 * @param {Object} args the object containing the content
 * @param {String} args.content the content to be posted
 */
function makeEntry(args){
  if(!args) args = {};
  if(!args.content) args.content = 'Rule#0 says you received a new mail!';
  call({
    service: '27',
    method: 'save',
    data: {
      companyId: '961',
      context: '17930',
      text: args.content
    }
  });
}
/**
 * Does everything to post something in roberts binder
 * @param {Object} args the object containing the content
 * @param {String} args.content the content to be posted
 */
function makeRobertEntry(args){
  if(!args.content) {
    console.trace('ERROR: Too few arguments!');
    console.log(args);
    return;
  }
  call({
    service: '27',
    method: 'save',
    data: {
      companyId: '961',
      context: '17936',
      text: args.content
    }
  });
  call({
    service: '2',
    method: 'setread',
    data: {
      id: args.id
    }
  });
}

init();

exports.purgeCredentials = purgeCredentials;
exports.verifyCredentials = verifyCredentials;
exports.call = call;
exports.getUnreadContents = getUnreadContents;
exports.getBinderTabContents = getBinderTabContents;
exports.getContent = getContent;
exports.makeEntry = makeEntry;
exports.makeRobertEntry = makeRobertEntry;
  
