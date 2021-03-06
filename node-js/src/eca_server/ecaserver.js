'use strict';
var express = require('express');
var qs = require('querystring');
var engine = require('./ecainference');


/**
 * If a request is made to the server, this function is used to handle it.
 */
function onRequest(request, response) {
  
  /**
   * Handles erroneous requests.
   * @param {Object} msg the error message to be returned
   */
  function answerError(msg) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.write(msg);
    response.end();
  }
  
  /**
   * Handles correct event posts, replies thank you.
   */
  function answerSuccess(){
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Thank you for the event!");
    response.end();
  }
  
  var body = '';
  request.on('data', function (data) { body += data; });
  request.on('end', function () {
    var obj = qs.parse(body);
    /*
     * If required event properties are present we process the event
     */
    if(obj && obj.type && obj.eventid){
      answerSuccess();
      engine.processRequest(obj);
    } else answerError('Your event was missing important parameters!');
  });
}

/*
 * Insert a set of rules into the rules repository
 */
engine.insertRule({
  id: 'rule_1',
  condition: {
    type: 'unreadcontent',
    userid: '12613'
  },
  actions: [
    {
      /*
       * Call the probinder service to store new events as a text
       */
      type: 'servicecall',
      apiprovider: 'probinder',
      method: 'call',
      arguments: {
        service: '27',
        method: 'save',
        data: {
          companyId: '643',
          context: '17209',
          text: '$X.username wrote: $X.text'
        }
      }
    },
    {
      /*
       * Call a probinder service to set the new content unread
       */
      type: 'servicecall',
      apiprovider: 'probinder',
      method: 'call',
      arguments: {
        service: '2',
        method: 'setread',
        data: {
          id: '$X.contentid'
        }
      }
    }
  ]
});

engine.insertRule({
  id: 'rule_2',
  condition: { type: 'newstudent' },
  actions: [
    {
      type: 'usernotify',
      arguments: {
        courseid: '$X.courseid',
        username: '$X.username',
        uniid: '$X.uniid',
        email: '$X.email',
        probinderid: '$X.probinderid'
      }
    }
  ]
});

/*
 * Initialize the rules engine
 */
engine.init(function(){
  /*
   * Start the server that listens for events after the engine initialized
   */
  var app = express();
  app.post('/', onRequest);
  app.listen(8125); // uni-directional event channel
  
  console.log("Server has started.");

});
