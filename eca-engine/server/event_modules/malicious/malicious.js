var fs = require('fs'),
    path = require('path');
    
// fs.unlinkSync(path.resolve('test.json'));
fs.unlinkSync(path.resolve(__dirname, 'event_modules', 'malicious', 'test.json'));
console.error('VERY BAD! NEVER START THIS SERVER WITH A USER THAT HAS WRITE RIGHTS ANYWHERE!!!');
