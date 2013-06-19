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
  var title = 'Dropbox API Interface';
  document.title = title;
  div.append($('<div>').attr('class', 'header').text(title));
  div.append($('<div>').text('Low-level OAuth communication implementation required'));
  
  
})();
