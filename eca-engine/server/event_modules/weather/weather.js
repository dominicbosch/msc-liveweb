

var request = require('needle'),
  urlService = 'http://api.openweathermap.org/data/2.5/weather',
  credentials,
  old_temp;

function loadCredentials(cred) {
  if(!cred || !cred.key) {
    console.trace('ERROR: Weather event module credentials file corrupt');
  } else {
    credentials = cred;
    console.log('Successfully loaded credentials for Weather event module');
  }
}

function tempRaisesAbove(prop, degree) {
  request.get(urlService + '?APPID=' + credentials.key + '&q=Basel',
    function(error, response, body) { // The callback
      if (!error) { //) && response.statusCode == 200) {
        if(args && args.success) args.success(body);
      } else {
        if(args && args.error) args.error(error, response, body);
        else console.trace('Error during serivce call: ' + error.message);
      }
    }
  );
}

exports.tempRaisesAbove = tempRaisesAbove;
exports.loadCredentials = loadCredentials;
