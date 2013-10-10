'use strict';
var eca = require('needle'),
  webapi = require('request'),
  fs = require('fs'),
  credentials = null,
  urlServer = 'localhost:8125',
  events = {},
  eId = 0;

function init() {
  loadCredentials();
  loadEventFile('evts');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', processUserInput);
  // Ctrl + D would end the process
  process.stdin.on('end', function() { console.log('user kills me o.O'); });
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
      if(arr.length < 2 || arr[1] === '') sendFromPacket('evts', 'mail1');
      else if(arr.length === 2) sendFromPacket('evts', arr[1]);
      else sendFromPacket(arr[1], arr[2]);
      break;
    case 'mail':
      console.log('Starting to check mails every 5 seconds');
      console.log('What would you like to do?');
      loopMailCheck();
      break;
    case 'unread':
      console.log('Starting to check for unread content every 10 seconds');
      console.log('What would you like to do?');
      loopUnreadCheck();
      break;
    case 'debug':
      debug();
      break;
    default: console.log('action (' + arr[0] + ') unknown! Known actions are: load, send, mail, unread');
  }
  // setTimeout(function() { console.log('What would you like to do?'); }, 1000);
}

function loadCredentials(){
  fs.readFile('credentials.json', 'utf8', function (err, data) {
    if (err) {
      console.trace('ERROR: Loading credentials');
      return;
    }
    credentials = JSON.parse(data);
    console.log('Successfully loaded credentials');
  });
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
    console.log('What would you like to do?');
  });
}

function sendFromPacket(pkt, evt) {
  if(!events[pkt] || !events[pkt][evt]) {
    console.log('No such event found: ' + evt + ' in packet ' + pkt);
    console.log('What would you like to do?');
    return;
  }
  var event = events[pkt][evt];
  event.eventid = 'eventproducer' + eId++;
  pushEvent(event);
}

function loopMailCheck(){
  checkMails();
  setTimeout(loopMailCheck, 5000);
}

function checkMails() {
  webapi.get('https://api.emailyak.com/v1/' 
      + credentials.emailyak + '/json/get/new/email/',
    function (error, response, body){
      if (!error && response.statusCode == 200) {
        var mails = JSON.parse(body).Emails;
        for(var i = 0; i < mails.length; i++) {
          mails[i].event = 'yakmail';
          mails[i].eventid = 'eventproducer' + eId++;
          pushEvent(mails[i]);
        }
      } else console.trace('error: ' + error);
    }
  );
}

function loopUnreadCheck(){
  checkUnread();
  setTimeout(loopUnreadCheck, 10000);
}

function checkUnread() {
  requestProBinder('36/unreadcontent', {}, 
    function(poorcontent) {
      for(var i = 0; i < poorcontent.length; i++) {
        requestProBinder(
          '2/get', {
            service: poorcontent[i].serviceId,
            id: poorcontent[i].id
          },
          function(fullcontent){
            // if(fullcontent.serviceId == '32') console.log(fullcontent);
            fullcontent.event = 'newfile';
            fullcontent.eventid = 'eventproducer' + eId++;
            pushEvent(fullcontent);
          }
        );
      }
    }
  );
}

/**
 * Issues an API call 
 * @param {Object} methodid the string that identifies a method, e.g. "2/get"
 * @param {Object} data the data that needs to be posted to the method
 * @param {Object} callback the callback receives the response body
 */
function requestProBinder(methodid, data, callback) {
  eca.post('https://probinder.com/service/' + methodid, data,
    credentials.probinder,
    function(error, response, body) {
      if (!error) callback(body);
      else console.log('Error during serivce call: ' + error.message);
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
      console.log('What would you like to do?');
    }
  );
}

function debug() {
  sendFromPacket('evts', 'debug');
}

init();
