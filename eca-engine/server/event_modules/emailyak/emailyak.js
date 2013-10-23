'use strict';

/*
 * EmailYak EVENT MODULE
 */

var webapi = require('request'),
  fs = require('fs'),
  urlService = 'https://probinder.com/service/',
  credentials = null,
  eId = 0;

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
    if(!credentials || !credentials.key) {
      credentials = null;
      console.trace('ERROR: credentials file corrupt');
    }
  });
}

//FIXME every second mail gets lost?
function newMail(callback) {
  webapi.get('https://api.emailyak.com/v1/' + credentials.key + '/json/get/new/email/',
    function (error, response, body){
      if (!error && response.statusCode == 200) {
        var mails = JSON.parse(body).Emails;
        for(var i = 0; i < mails.length; i++) callback({ data: mails[i] });
      } else console.trace('error: ' + error);
    }
  );
}

init();

exports.newMail = newMail;