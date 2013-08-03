'use strict';
var request = require('needle');
var pb = require("../probinder/probinder");
var urlServer = 'localhost:8125';

/*
 * Let the probinder module load the credentials and notify this module of its
 * success by calling the ready function
 */
pb.init({
  file: '../probinder/credentials.json', 
  success: ready
});

function ready() {
  var event = {
    type: 'newstudent',
    eventid: 'cloud2web0',
    courseid: 'cs101',
    uniid: 'bhtest00',
    probinderid: '12613',
    email: 'dominic.bosch.db@gmail.com',
    username: 'Test Student'
  };
  request.post(urlServer,
    event,
    function(error, response, body) { // The callback
      if (!error && response.statusCode == 200) {
        console.log('event sent, response: ' + body);
      } else {
        console.log(error.message);
      }
    }
  );
}