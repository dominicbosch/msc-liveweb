
(function(){
  var div = $('<div>').appendTo($('body')), urlparams = {};
  var wl = window.location.search.substring(1);
  if(wl){
    wl = wl.split('&');
    for(var i = 0; i < wl.length; i++){
      var kv = wl[i].split('=');
      urlparams[kv[0]] = kv[1];
    }
  }
  var title = 'Last.fm API Interface';
  document.title = title;
  div.append($('<div>').attr('class', 'header').text(title));
  
  
  var api_key = '89b550d2dbd83432671324df515d3829',
    // cb = 'http://localhost/lastfm.html',
    cb = 'http://dominicbosch.github.io/msc-liveweb/lastfm.html',
    ws = "http://ws.audioscrobbler.com/2.0/",
    session_key = '';
  /**
   * This has to be kept hidden in the server for security reasons.
   * api signature = md5("api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxxmysecret")
   */
  function signMethod(params){
    params.api_key = api_key;
    if(session_key) params.sk = session_key;
    var secret = '76a99e642cff2787b92cf8965828e0c6';
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
    console.log('method signature: ' + str);
    return md5(unescape(encodeURIComponent(str+secret)));
  }
  
  function getSession(tkn){
    callMethod(
      {
        method: 'auth.getSession',
        token: tkn
      },
      function(d){
        if(d.session.key) {
          $('<div>').text('Got session key: '+d.session.key).appendTo(div);
          session_key = d.session.key;
          callMethod({
            method: 'playlist.create',
            title: 'myhelloworldlist'
          },
          function(d){
            console.log('playlist create');
            console.log(d);
            var p = d.playlists.playlist;
            $('<div>').text('Playlist "'+p.title+'" created by "'+p.creator+'" on '+p.date).appendTo(div);
          }, 'post');
        }
      }
    );
  }
  
  function callMethod(params, callback, method){
    params.api_sig = signMethod(params);
    params.api_key = api_key;
    if(session_key) params.sk = session_key;
    console.log('session key: ' + session_key);
    params.format = 'json';
    var req = {
      dataType: "json",
      url: ws,
      data: params,
      success: callback
    }
    if(method) req.method = method;
    $.ajax(req);
    // $.getJSON(ws, params, callback);
  }
  
  if(urlparams.token){
    $('<div>').text('Got token: '+urlparams.token).appendTo(div);
    getSession(urlparams.token);
  } else {
    $('<button>')
      .attr('id', 'authButton')
      .text('authorize')
      .appendTo(div)
      .click(function(){
        window.location = 'http://www.last.fm/api/auth/?api_key='+api_key+'&cb='+cb;
      });
  }
  

})();




