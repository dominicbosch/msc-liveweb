'use strict';
var assert = require('assert');
var probinder = require("./probinder");
var fs = require('fs');
var credentials, testStack = [], testNum = 0;

function assrt(bool, msg) {
  try{
    assert(bool, msg);
    console.log('Passed: ' + msg);
  } catch (err) {
    console.log('Failed: ' + msg);
  }
}
  
fs.readFile('./credentials.json', 'utf8', function (err, data) {
  if (err) return;
  credentials = JSON.parse(data);
  testSuite();
});

function testSuite() {
  assrt(probinder, 'Modue loaded');
  assrt(credentials, 'Credentials loaded');
  assrt(credentials.username === 'dominic.bosch@stud.unibas.ch', 'Credentials username correct');
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init();
    setTimeout(function() {
      assrt(probinder.verifyCredentials(credentials.username, credentials.password), 'Init with no argument');
      nextAsyncTest();
    }, 100);
  });
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init({});
    setTimeout(function() {
      assrt(probinder.verifyCredentials(credentials.username, credentials.password), 'Init with empty object argument');
      nextAsyncTest();
    }, 100);
  });
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init({
      file: './credentials.json'
    });
    setTimeout(function() {
      assrt(probinder.verifyCredentials(credentials.username, credentials.password), 'Init with file argument');
      nextAsyncTest();
    }, 100);
  });
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init({
      file: './wrong.json'
    });
    setTimeout(function() {
      assrt(!probinder.verifyCredentials(credentials.username, credentials.password), 'Init with wrong file argument');
      nextAsyncTest();
    }, 100);
  });
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init({
      file: './credentials.json',
      success: function() {
        assrt(probinder.verifyCredentials(credentials.username, credentials.password), 'Init with file argument and success callback');
        nextAsyncTest();
      },
      error: function() {
        assrt(!probinder.verifyCredentials(credentials.username, credentials.password), 'Init with wrong file argument and error callback');
        nextAsyncTest();
      }
    });
  });
  
  testStack.push(function(){
    probinder.purgeCredentials();
    probinder.init({
      file: './wrong.json',
      success: function() {
        assrt(probinder.verifyCredentials(credentials.username, credentials.password), 'Init with file argument and success callback');
        nextAsyncTest();
      },
      error: function() {
        assrt(!probinder.verifyCredentials(credentials.username, credentials.password), 'Init with wrong file argument and error callback');
        nextAsyncTest();
      }
    });
  });
  
  /*
   * TODO call requests with insufficient params
   */
  
  nextAsyncTest();
}

function nextAsyncTest(){
  if(testStack.length > testNum) testStack[testNum++]();
}

