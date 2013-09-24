'use strict';
var request = require('needle');
var fs = require('fs');
var urlServer = 'localhost:8125';
var events = {};
var eId = 0;

function init() {
  loadEventFile('evts');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', processUserInput);
  // Ctrl + D would end the process
  process.stdin.on('end', function() { console.log('user kills me o.O'); });
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function processUserInput(chunk) {
  var arr = chunk.replace(/\n/g, "").split(' ');
  if(arr.length < 2) {
    console.log('Too few arguments!');
    return;
  }
  switch(arr[0]) {
    case 'load':
      loadEventFile(arr[1]);
      break;
    case 'send':
      if(arr.length === 2) send('evts', arr[1]);
      else send(arr[1], arr[2]);
      break;
    default: console.log('action unknown!');
  }
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadEventFile(name) {
  // fs.readFile(__dirname + '/' + name + '.json', 'utf8', function (err, data) {
  fs.readFile(name + '.json', 'utf8', function (err, data) {
    if (err) {
      console.log('ERROR: Loading events file: ' + name + '.json');
      return;
    }
    events[name] = JSON.parse(data);
    console.log('Successfully loaded events file: ' + name + '.json');
  });

}

function send(pkt, evt) {
  var event = events[pkt][evt];
  event.eventid = 'eventproducer' + eId++;
  request.post(urlServer,
    event,
    function(error, response, body) { // The callback
      if (!error && response.statusCode == 200) {
        console.log(' > event sent! Server response: ' + body);
      } else {
        console.log(' > event error! Server response: ' + body);
      }
    }
  );
}

init();
