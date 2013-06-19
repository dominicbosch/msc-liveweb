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
  
  var client_id = '833085220207.apps.googleusercontent.com';
  var access_token = '';
  if(!urlparams.state) {
    var button = $('<button>')
      .attr('id', 'authButton')
      .text('authorize')
      .appendTo(div)
      .click(function(){
        var authurl = 'https://accounts.google.com/o/oauth2/auth',
          // redirect_uri = 'http://localhost/google.html',
          redirect_uri = 'http://dominicbosch.github.io/msc-liveweb/google.html',
          scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email'
            +'+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar';
        window.location = authurl
          + '?client_id=' + client_id
          + '&redirect_uri=' + redirect_uri
          + '&scope=' + scope 
          + '&state=auth'
          + '&response_type=token';
    });
  } else {
    function checkValidation(d) {
      console.log(d);
      $('#validateButton').remove();
      var valid = (d.audience === client_id);
      div.append($('<div>').text('Got validation response: ' + valid));
      if(valid) {
        $.getJSON(
          'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + access_token,
          function(d){
            console.log(d);
            div.append($('<div>').text('You are : ' + d.email + ' and your email verification status is: ' + d.verified_email));
          }
        );
        var calID =  'pm55ibb4kg98vv58juiq5shu48@group.calendar.google.com';//msc.theliveweb@gmail.com
        $.getJSON(
        'https://www.googleapis.com/calendar/v3/calendars/'+calID+'/events?access_token=' + access_token,
          function(d){
            console.log(d);
            div.append($('<div>').text('You have following calendar entries: '));
            var ul = $('<ul>').appendTo(div);
            for(var i = 0; i < d.items.length; i++){
              ul.append($('<li>').text(d.items[i].summary));
            }
          }
        );
        $.ajax(
          'https://www.googleapis.com/calendar/calendar/v3/calendars/'+calID+'/events',
          {
            access_token: access_token,
            start: { dateTime: '2013-06-23T00:39:57Z' },
            end: { dateTime: '2013-06-23T02:39:57Z' },
            description: 'test insertion'
          },
          function(d){
            console.log('new entry added');
            console.log(d);
          }
        );
      }
    }
    
    function validate() {
      $.getJSON('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + access_token, checkValidation);
    }
    
    switch(urlparams.state){
    case 'auth':
      access_token = urlparams.access_token;
      div.append($('<div>').text('Got access token: ' + urlparams.access_token));
      div.append($('<button>')
        .attr('id', 'validateButton')
        .text('validate token')
        .appendTo(div)
        .click(validate)
      );
    }
  }
})();
