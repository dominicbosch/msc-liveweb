'use strict';
var app = require('http').createServer(handler),
  io = require('socket.io').listen(app, { log: false }),
  fs = require('fs');
  
app.listen(8080);

function handler (req, res) {
  console.log('Somebody requested: ' + req.url);
  var fl = req.url;
  if(fl == '/') fl = '/course101.html';
  fs.readFile('./webpage' + fl,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + req.url);
    }
    res.writeHead(200);
    res.end(data);
  });
}

// io.sockets.on('connection', function (socket) {
  // socket.emit('ping', { type: 'ping' });
  // socket.on('pong', function (data) {
    // console.log(data);
  // });
// });

function sendEvent(evt) {
  io.sockets.emit('engine', evt);
}

exports.sendEvent = sendEvent;