//http://api.openweathermap.org/data/2.5/weather?q=Basel&APPID=244a2aef6a1367ea21458cd14e1a6ec4
var credentials;

function loadCredentials(cred) {
  if(!cred || !cred.key) {
    console.trace('ERROR: Weather event module credentials file corrupt');
  } else {
    credentials = cred;
    console.log('Successfully loaded credentials for Weather event module');
  }
}


exports.loadCredentials = loadCredentials;
