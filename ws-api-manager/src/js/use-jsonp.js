(function(){
  var div = $('#jshook'), urlparams = {};
  var wl = window.location.hash.substring(1);
  if(wl){
    wl = wl.split('&');
    for(var i = 0; i < wl.length; i++){
      var kv = wl[i].split('=');
      urlparams[kv[0]] = kv[1];
    }
  }

  $('<h2>').text('JSONP examples').appendTo(div);
  $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=89b550d2dbd83432671324df515d3829&format=json",
    function(data) {
      $('<h3>').text('Last.fm without padding:').appendTo(div);
      $('<div>').text(data.artist.name + ': ' + data.artist.url).appendTo(div);
    }
  );

  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
    {
      tags: "jquery",
      tagmode: "any",
      format: "json"
    },
    function(data) {
      $('<h3>').text('Flickr with padding:').appendTo(div);
      var ul = $('<ul>').appendTo(div);
      $.each(data.items, function(i, item){
        ul.append($('<li>').text(item.media.m));
        if ( i == 5 ) return false;
      });
    }
  );

  setTimeout(function() {
    $('<h3>').text('ProBinder without padding:').appendTo(div);
    $.ajax({
      dataType: "json",
      url: "https://probinder.com/service/23/search/query/marketing-plan"
    })
    .done(function(data) {
      var ul = $('<ul>').appendTo(div);
      $.each(data.items, function(i, item){
        ul.append($('<li>').text(item.media.m));
        if ( i == 10 ) return false;
      });
    })
    .fail(function(e, v) {
      $('<div>').text('Failed: ' + e.statusText).appendTo(div);
    });
  }, 2000);
  
  setTimeout(function() {
    $('<h3>').text('ProBinder with padding:').appendTo(div);
    $.getJSON("https://probinder.com/service/23/search/query/marketing-plan?jsoncallback=?",
      {
        tags: "jquery",
        tagmode: "any",
        format: "json"
      },
      function(data) {
        var ul = $('<ul>').appendTo(div);
        $.each(data.items, function(i, item){
          ul.append($('<li>').text(item.media.m));
          if ( i == 10 ) return false;
        });
      }
    );
  }, 4000);

  
})();
