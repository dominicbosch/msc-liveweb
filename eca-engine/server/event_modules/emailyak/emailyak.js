'use strict';

var needle = require('request');

/*
 * EmailYak EVENT MODULE
 */

var credentials = null;

function loadCredentials(cred) {
    if(!cred || !cred.key) {
      console.error('ERROR in EmailYak EM: credentials file corrupt');
    } else {
      credentials = cred;
      console.log('Successfully loaded EmailYak EM credentials');
    }
}

//FIXME every second mail gets lost?
function newMail(callback) { //FIXME not beautiful to have to set prop each time here
  needle.get('https://api.emailyak.com/v1/' + credentials.key + '/json/get/new/email/',
    function (error, response, body){
      if (!error && response.statusCode == 200) {
        var mails = JSON.parse(body).Emails;
        for(var i = 0; i < mails.length; i++) callback(mails[i]);
      } else console.error('ERROR in EmailYak EM newMail: ' + error);
    }
  );
}

exports.loadCredentials = loadCredentials;
exports.newMail = newMail;
