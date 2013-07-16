
function route(pathname, query) {
  console.log("About to route a request for " + pathname);
  var app = null;
	switch(pathname) {
		case 'probinder':
			app = require("./probinder");
	}
	if(app) app.processRequest();
	else console.log('nothing todo');
	
}

exports.route = route;