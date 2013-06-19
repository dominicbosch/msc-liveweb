/*
 * Sandbox
 */
(function(){
  var api_key = '5d0fa74328931c4060c118cbf74ab12e',
    cb = 'http://dominicbosch.github.io/msc-theliveweb/lastfm.html',
    ws = "http://ws.audioscrobbler.com/2.0/",
    du = window.location.search.substring(1),
    session_key = '';
    urlparams = {};
  
  /**
   * This has to be kept hidden in the server for security reasons.
   */
  function signMethod(params){
    params.api_key = api_key;
    var secret = '3d8ac9ae52dc6eeeb0f8333def8149c8';
    var keys = [], str = '';
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
      str += keys[i]+params[keys[i]];
    }
    return md5(unescape(encodeURIComponent(str+secret)));
  }
  
  function getSession(tkn){
    callMethod(
      {
        method: 'auth.getSession',
        token: tkn
      },
      function(d){
        console.log('got session key');
        console.log(d);
        if(d.session.key) {
          session_key = d.session.key;
          callMethod({
            method: 'playlist.create',
            title: 'myhelloworldlist'
          });
        }
      }
    );
  }
  
  function callMethod(params, callback){
    params.api_sig = signMethod(params);
    params.api_key = api_key;
    params.sk = session_key;
    params.format = 'json';
    $.getJSON(ws, params, callback);
  }
  
  if(du){
    du = du.split('&');
    for(var i = 0; i < du.length; i++){
      var kv = du[i].split('=');
      urlparams[kv[0]] = kv[1];
    }
  }
  if(urlparams.token){
    console.log('got token: ' + urlparams.token);
    getSession(urlparams.token);
  } else {
    window.location = 'http://www.last.fm/api/auth/?api_key='+api_key+'&cb='+cb;
  }
  

})();




