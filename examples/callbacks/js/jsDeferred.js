/*
The function deferral measurements in node.js
*/

// If this is executed we didn't wait long enough
var deferredFunction = function ( numScopeVars, delay, scopeId ) {
	var scope = {};
	for ( var i = 0; i < numScopeVars; i++ ) {
		scope[ "id" + i ] = "12345678"; // 8 bytes per stored scope variable
	}
	setTimeout( function () {
		console.log( JSON.stringify( scope, null, '  ' ) );
		// console.log( this );
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
	// deferredFunction( numOfScopeVars, 1, numOfFunctions + "(" + i + ")" );
	deferredFunction( numOfScopeVars, 1000 * numOfFunctions, numOfFunctions + "(" + i + ")" );
};

var mem = process.memoryUsage();
var diff = process.hrtime( time );
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