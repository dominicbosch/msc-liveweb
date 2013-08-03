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
  if (request.method == 'POST') {
    var body = '';
    request.on('data', function (data) { body += data; });
    request.on('end', function () {
      var obj = qs.parse(body);
      /*
       * If required event properties are present we process the event
       */
      if(obj && obj.type && obj.eventid && obj.userid && obj.text){
        answerSuccess();
        engine.processRequest(obj);
      } else answerError('Your event was missing important parameters!');
    });
  } else answerError("I expected a POST request from you!");
}

/*
 * Insert a set of rules into the rules repository
 */
engine.insertRule({
  id: 'rule_1',
  condition: {
    type: 'newcontent',
    userid: '12613'
  },
  actions: [
    {
      type: 'servicecall',
      apiprovider: 'probinder',
      method: 'call',
      arguments: {
        service: '27',
        method: 'save',
        data: {
          companyId: '643',
          context: '17209',
          text: '$X.username wrote: $X.text',
          test: { t: 'brunt', o: {g: 'goozee'} }
        }
      }
    }
  ]
});

/*
 * Start the server that listens for events
 */
var app = express();
app.post('/', onRequest);
app.listen(8125);
console.log("Server has started.");
