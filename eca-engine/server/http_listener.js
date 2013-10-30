'use strict';

var express = require('express'),
  qs = require('querystring'),
  eventHandler;
  
function init(http_port, funcEvtHandler) {
  if(!http_port || !funcEvtHandler) {
    console.error(' | HL | ERROR: either port or eventHandler function not defined!');
    return;
  }
  eventHandler = funcEvtHandler;
  var app = express();
  app.post('/', onRequest);
  app.listen(http_port); // inbound event channel
  console.log(" | HL | Started listening for http requests on port " + http_port);
}  
  
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
  function answerSuccess(msg){
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Thank you for the event (" + msg + ")!");
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
      if(obj && obj.event && obj.eventid){
        answerSuccess(obj.event + '[' + obj.eventid + ']');
        eventHandler(obj);
      } else answerError('Your event was missing important parameters!');
    });
  } else {
    //TODO implement admin commands
    answerSuccess('GET REQUEST');
    
    //answerError('Illegal request method found!');
  }
}

exports.init = init;
