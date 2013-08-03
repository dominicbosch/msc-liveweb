'use strict';
var request = require('needle');
var pb = require("../probinder/probinder");
var urlServer = 'localhost:8125';
var iEvent = 0;

/*
 * Let the probinder module load the credentials and notify this module of its
 * success by calling the ready function
 */
pb.init({
  file: '../probinder/credentials.json', 
  success: ready
});

/*
 * If probinder loaded successfully, this function is invoked
 */
function ready(){
  /* 
   * We fetch the unread contents as a pull request from probinder. this represents
   * the monitoring of a static resource, even though probinder is not static.
   * Incorporating a webcrawler on a real static resource would have increased
   * the complexity greatly and it also isn't the core of this usability study
   */
  console.log('Fetching eventual new contents');
  pb.getUnreadContents({
    success: processContentArray,
    error: function(error, response, body) {
      console.log('Unable to fetch unread contents: ' + error.message);
    }
  });
  
  /*
   * Fetch unread contents every 20 seconds
   */
  setTimeout(ready, 20000);
  // pb.getBinderTabContents({
    // tabid: '16420',
    // success: processContentArray,
    // error: function(error, response, body) {
      // console.log('Unable to fetch binder tab contents: ' + error.message);
    // }
  // });
}

/**
 * Content lists arrive usually as an array of metadata information which allow
 * the user of the probinder API to retrieve the actual content.
 * @param {Object} arr the array containing the content metadata
 */
function processContentArray(arr) {
  if(arr.length === 0) console.log('nothing to process');
  for(var i = 0; i < arr.length; i++){
    console.log('Fetching content for ' + arr[i].id);
    pb.getContent({
      serviceid: arr[i].serviceId,
      contentid: arr[i].id,
      userid: arr[i].userId,
      success: pushContentAsEvent
    });
  }
}

/**
 * After the content has been retrieved via the appropriate service 
 * @param {Object} response
 */
function pushContentAsEvent(response) {
  var event = {
    type: 'newcontent',
    eventid: 'web2cloud' + iEvent++,
    userid: response.userId,
    username: response.username,
    contentid: response.id,
    text: response.text
  };
  request.post(urlServer,
    event,
    function(error, response, body) { // The callback
      if (!error && response.statusCode == 200) {
        console.log('event sent, response: ' + body);
      } else {
        console.log(error.message);
      }
    }
  );
}
