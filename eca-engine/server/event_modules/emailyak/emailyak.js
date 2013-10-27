'use strict';

/*
 * EmailYak EVENT MODULE
 */

var webapi = require('request'),
  fs = require('fs'),
  credentials = null;

function loadCredentials(cred) {
    if(!cred || !cred.key) {
      console.trace('ERROR: EmailYak event module credentials file corrupt');
    } else {
      credentials = cred;
      console.log('Successfully loaded EmailYak event module credentials');
    }
}

//FIXME every second mail gets lost?
function newMail(callback) { //FIXME not beautiful to have to set prop each time here
  webapi.get('https://api.emailyak.com/v1/' + credentials.key + '/json/get/new/email/',
    function (error, response, body){
      if (!error && response.statusCode == 200) {
        var mails = JSON.parse(body).Emails;
        for(var i = 0; i < mails.length; i++) callback(mails[i]);
      } else console.trace('error: ' + error);
    }
  );
}

exports.loadCredentials = loadCredentials;
exports.newMail = newMail;
