'use strict';

var express = require('express'),
  qs = require('querystring'),
  adminHandler, eventHandler;
  
function init(http_port, funcAdminHandler, funcEvtHandler) {
  if(!http_port || !funcEvtHandler) {
    console.error(' | HL | ERROR: either port or eventHandler function not defined!');
    return;
  }
  adminHandler = funcAdminHandler;
  eventHandler = funcEvtHandler;
  var app = express();
  app.get('/admin', onAdminCommand);
  app.post('/pushEvents', onPushEvent);
  app.listen(http_port); // inbound event channel
  console.log(" | HL | Started listening for http requests on port " + http_port);
}

/**
 * Handles correct event posts, replies thank you.
 */
function answerSuccess(resp, msg){
  resp.writeHead(200, { "Content-Type": "text/plain" });
  resp.write(msg);
  resp.end();
}

/**
 * Handles erroneous requests.
 * @param {Object} msg the error message to be returned
 */
function answerError(resp, msg) {
  resp.writeHead(400, { "Content-Type": "text/plain" });
  resp.write(msg);
  resp.end();
}

function onAdminCommand(request, response) {
  var q = request.query;
  console.log(' | HL | Received admin request: ' + request.originalUrl);
  if(q.cmd) {
    adminHandler(q);
    answerSuccess(response, 'Thank you, we try our best!');
  } else answerError(response, 'I\'m not sure about what you want from me...');
}
  
/**
 * If a request is made to the server, this function is used to handle it.
 */
function onPushEvent(request, response) {
  var body = '';
  request.on('data', function (data) { body += data; });
  request.on('end', function () {
    var obj = qs.parse(body);
    /* If required event properties are present we process the event */
    if(obj && obj.event && obj.eventid){
      answerSuccess(response, 'Thank you for the event (' + obj.event + '[' + obj.eventid + '])!');
      eventHandler(obj);
    } else answerError(response, 'Your event was missing important parameters!');
  });
}

exports.init = init;
