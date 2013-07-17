var request = require('request');
var lifetime = 10;

function runContentProducer() {
	if(lifetime-- > 0) {
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
	
		setTimeout(runContentProducer, 20000);
	}
}
runContentProducer();
