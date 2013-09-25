'use strict';
var eca = require('needle'),
  webapi = require('request'),
  fs = require('fs'),
  urlServer = 'localhost:8125',
  events = {},
  eId = 0;

function init() {
  loadEventFile('evts');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', processUserInput);
  // Ctrl + D would end the process
  process.stdin.on('end', function() { console.log('user kills me o.O'); });
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
  setTimeout(loopMailCheck, 5000);
}

function loopMailCheck(){
  checkMails();
  setTimeout(loopMailCheck, 5000);
}

function processUserInput(chunk) {
  var arr = chunk.replace(/\n/g, "").split(' ');
  if(arr.length < 1) {
    console.log('Too few arguments!');
    return;
  }
  switch(arr[0]) {
    case 'load':
      loadEventFile(arr[1]);
      break;
    case 'send':
      if(arr.length < 2) sendFromPacket('evts', 'mail');
      if(arr.length === 2) sendFromPacket('evts', arr[1]);
      else sendFromPacket(arr[1], arr[2]);
      break;
    case 'checkmails':
      checkMails();
      break;
    default: console.log('action (' + arr[0] + ') unknown! Known actions are: load, send, checkmails');
  }
  setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadEventFile(name) {
  // fs.readFile(__dirname + '/' + name + '.json', 'utf8', function (err, data) {
  fs.readFile(name + '.json', 'utf8', function (err, data) {
    if (err) {
      console.trace('ERROR: Loading events file: ' + name + '.json');
      return;
    }
    events[name] = JSON.parse(data);
    console.log('Successfully loaded events file: ' + name + '.json');
  });

}

function sendFromPacket(pkt, evt) {
  var event = events[pkt][evt];
  event.id = 'eventproducer' + eId++;
  pushEvent(event);
}

function checkMails() {
  webapi.get('https://api.emailyak.com/v1/ps1g59ndfcwg10w/json/get/new/email/',
    function (error, response, body){
      if (!error && response.statusCode == 200) {
        var mails = JSON.parse(body).Emails;
        // if(mails.length == 0) console.log('No new mails received!');
        for(var i = 0; i < mails.length; i++) {
          mails[i].event = 'mail';
          mails[i].id = 'eventproducer' + eId++;
          pushEvent(mails[i]);
        }
      } else console.trace('error: ' + error);
    }
  );
}

function pushEvent(evt) {
  eca.post(urlServer,
    evt,
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
