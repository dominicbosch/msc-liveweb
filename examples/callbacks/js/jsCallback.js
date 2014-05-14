
/*
The callback measurements in node.js
*/

var util = require('util'),
		events = require( 'events' ),
		eventEmitter = new events.EventEmitter();

eventEmitter.addListener 'rule', eh


eventEmitter.emit 'rule',
	intevent: 'init'
	user: user
	rule: oRule


var toBeScoped = function( scope ) {

}

for
console.log(util.inspect(process.memoryUsage()));
// This will generate:

// { rss: 4935680,
//   heapTotal: 1826816,
//   heapUsed: 650472 }
// heapTotal and heapUsed refer to V8's memory usage.


/*
The function deferral measurements in node.js
*/

// If this is executed we didn't wait long enough
var callbackFunction = function ( numScopeVars, delay, scopeId ) {
	var scope = {};
	for ( var i = 0; i < numScopeVars; i++ ) {
		scope[ "id" + i ] = "12345678"; // 8 bytes per stored scope variable
	}
	setTimeout( function () {
		console.log( JSON.stringify( scope, null, '  ' ) );
	}, delay );
}

var numOfFunctions,
		numOfScopeVars = process.argv[ 3 ];

if( !process.argv[ 2 ] || !numOfScopeVars ) {
	console.log( 'Please provide arguments: #functions(' + process.argv[ 2 ]
		+ ') & #scopeVars(' + numOfScopeVars + ')');
	process.exit( 1 );
}

numOfFunctions = Math.pow( 2,  process.argv[ 2 ] );
var time = process.hrtime();

for (var i = 0; i < numOfFunctions; i++) {
	eventEmitter.addListener 'rule', callbackFunction( numOfScopeVars, 1000 * numOfFunctions, numOfFunctions + "(" + i + ")" );
};
var diff = process.hrtime( time );
var mem = process.memoryUsage();
console.log(
	"#variables in scope\t" + numOfScopeVars
	+ "\ti:\t" + process.argv[ 2 ]
	+ "\t#deferred functions\t" + numOfFunctions 
	+ "\tMemory Used (MB)\t" + ( mem.rss / 1024 / 1024 )
	+ "\theapTotal (MB)\t" + ( mem.heapTotal / 1024 / 1024 )
	+ "\theapUsed (MB)\t" + ( mem.heapUsed / 1024 / 1024 )
	+ "\tElapsed (ms)\t" + ( diff[0]*1e9 + diff[1] ) / 1e6
);
time = process.hrtime();
diff = process.hrtime( time );
mem = process.memoryUsage();
console.log(
	"#variables in scope\t" + numOfScopeVars
	+ "\ti:\t" + process.argv[ 2 ]
	+ "\t#deferred functions\t" + numOfFunctions 
	+ "\tMemory Used (MB)\t" + ( mem.rss / 1024 / 1024 )
	+ "\theapTotal (MB)\t" + ( mem.heapTotal / 1024 / 1024 )
	+ "\theapUsed (MB)\t" + ( mem.heapUsed / 1024 / 1024 )
	+ "\tElapsed (ms)\t" + ( diff[0]*1e9 + diff[1] ) / 1e6
);

process.exit( 0 );