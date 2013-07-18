// var http = require("http");
var request = require('request');
var fs = require('fs');
var credentials = null;

// fs.readFile('./credentials.json', 'utf8', function (err, data) {
	// if(!err) {
  	// credentials = JSON.parse(data);
  	// console.log('credentials loaded');
  // }
// });
 
fs.readFile('./credentials.json', 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
  credentials = JSON.parse(data);
});

function getPage(url){
	function getResponse(error, response, body){
    console.log(body);
	  if (!error && response.statusCode == 200) {
	    console.log('success');
	  } else {
	  	console.log('error');
	  }
	}
	
// https://probinder.com/service/26/loginbinder/email/USERNAME/password/PASSWORT

  // var myurl = "https://probinder.com/service/26/loginbinder/email/"+credentials.username+"/password/"+credentials.password;
  url = "https://probinder.com/service/36/unreadcontent"
// console.log(myurl);
// request(  
    // {  
    	// method: 'POST',
        // url : myurl
    // },  
// getResponse
// );  

	// request.get(url, getResponse).auth(credentials.username, credentials.password, false);
	var auth = {
				user: credentials.username,
				pass: credentials.password
		};
	request(
		{
			url: url,
			method: 'POST',
			auth: auth
		},
		getResponse
	);
}

function post(){
	console.log('issuing request');
	if(app && credentials){
		request.post(
		  {
		  	url: 'http://localhost:8125',
		    form: {
		    	key: 'value',
		    	
		    }
		  },
		  function (error, response, body) {
		    console.log('got reply:');
		    console.log(body);
		  }
		);
	}
	else console.log('not ready');
}

function callService(){
	console.log('issuing request');
	if(app && credentials){
		request.post(
		  {
		  	url: 'https://probinder.com/service/',
		    form: {
		    	key: 'value',
		    	
		    }
		  },
		  function (error, response, body) {
		    console.log('got reply:');
		    console.log(body);
		  }
		);
	}
	else console.log('not ready');
}

exports.post = post;
exports.getPage = getPage;