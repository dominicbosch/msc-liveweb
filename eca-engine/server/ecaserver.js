'use strict';
var express = require('express');
var qs = require('querystring');
var fs = require('fs');
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
      if(obj && obj.type && obj.eventid){
        answerSuccess();
        engine.processRequest(obj);
      } else answerError('Your event was missing important parameters!');
    });
  } else answerError('Illegal request method found!');
}

fs.readFile('config.json', 'utf8', function (err, data) {
  if (err) {
    console.log('ERROR: Loading config file');
    return;
  }
  var config = JSON.parse(data);
  var arr = config.rules;
  for(var i = 0; i < arr.length; i++) engine.insertRule(arr[i]);
  
  /*
   * Initialize the rules engine after rules were loaded
   */
  engine.init(function(){
    /*
     * Start the server that listens for events after the engine initialized
     */
    var app = express();
    app.post('/', onRequest);
    app.listen(config.inboundport); // inbound event channel
    console.log("Server has started.");
  });
});
