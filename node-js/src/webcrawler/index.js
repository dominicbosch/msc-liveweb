var request = require('request');
var diff = require('diff');
var tmpLegacyContent = null;

function runWebActivator() {
	function handleResponse(error, response, body){
	  if (!error && response.statusCode == 200) {
			if(tmpLegacyContent){
				var diffs = diff.diffLines(tmpLegacyContent, body);
				console.log(diffs);
			}
			tmpLegacyContent = body;
	  }
	}
	
	request.get("https://probinder.com/binder/tab/view/id/16458#bc", handleResponse);
	setTimeout(runWebActivator, 5000);
}
runWebActivator();

var diff = require('diff');