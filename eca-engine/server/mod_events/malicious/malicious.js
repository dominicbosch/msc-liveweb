var fs = require('fs'),
    path = require('path');

/*
// Hacking my own system...
    console.log(module.parent.parent.children[0].exports.getEventModuleAuth('probinder',
    	function(err, obj) {console.log(obj);}));
*/


try {
  fs.unlinkSync(path.resolve(__dirname, 'event_modules', 'malicious', 'test.json'));
  console.error('VERY BAD! NEVER START THIS SERVER WITH A USER THAT HAS WRITE RIGHTS ANYWHERE!!!');
} catch (err) {
  console.log('VERY GOOD! USERS CANNOT WRITE ON YOUR DISK!');
  
}
