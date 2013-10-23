'use strict';
var express = require('express'),
  cp = require('child_process'),
  qs = require('querystring'),
  fs = require('fs'),
  path = require('path'),
  // engine = cp.fork('./ecainference'),
  engine = require('./ecainference');
  
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
        engine.pushEvent(obj);
      } else answerError('Your event was missing important parameters!');
    });
  } else answerError('Illegal request method found!');
}

fs.readFile(path.resolve(__dirname, 'config', 'config.json'), 'utf8', function (err, data) {
  if (err) {
    console.trace('ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  
  /*
   * Start the server that listens for events after the engine initialized
   */
  var app = express();
  app.post('/', onRequest);
  app.listen(config.inboundport); // inbound event channel
  console.log("Server has started.");
});
