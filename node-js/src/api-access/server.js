var http = require("http");
var url = require("url");
var express = require('express');

function start(route) {
  function onRequest(request, response) {
  	var objUrl = url.parse(request.url);
    var pathname = objUrl.pathname;
    var query = objUrl.query;
    var format = '';
    if(query && query.format) format = query.format;
    console.log(objUrl)
    
    console.log("Request for " + pathname + " received.");

		switch(format) {
			case 'json':
				response.writeHead(200, {"Content-Type": "application/json"});
    		console.log("json format");
				break;
			default:
				response.writeHead(200, {"Content-Type": "text/plain"});
				console.log("default format");
		}
	
    route(pathname, query);

    response.write("Hello World");
    response.end();
  }
  
	function onEvent(request, response) {
  	
    console.log(request.body);

    response.write("Received Body");
    response.end();
  }

	
	var app = express();
	app.post('/', onEvent);
	app.listen(8125);
  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}
exports.start = start;