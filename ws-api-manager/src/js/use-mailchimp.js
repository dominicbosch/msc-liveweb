(function(){
  var div = $('<div>').appendTo($('body')), urlparams = {};
  var wl = window.location.hash.substring(1);
  if(wl){
    wl = wl.split('&');
    for(var i = 0; i < wl.length; i++){
      var kv = wl[i].split('=');
      urlparams[kv[0]] = kv[1];
    }
  }
  var title = 'Mailchimp API Interface';
  document.title = title;
  div.append($('<div>').attr('class', 'header').text(title));
  
  var client_id = '877100874064',
    secret = '69caa7cd76debdf2183a8723a5540947', // TODO keep this secret in productive
    redirect_uri = 'http://dominicbosch.github.io/msc-liveweb/mailchimp.html',
    authorize_uri =  'https://login.mailchimp.com/oauth2/authorize',
    access_token_uri = 'https://login.mailchimp.com/oauth2/token',
    base_uri = 'https://login.mailchimp.com/oauth2/',
    metadata_uri = 'https://login.mailchimp.com/oauth2/metadata';
    
  var access_token = '';
  if(!urlparams.code) {
    var button = $('<button>')
      .attr('id', 'authButton')
      .text('authorize')
      .appendTo(div)
      .click(function(){
        window.location = authorize_uri
          + '?client_id=' + client_id
          + '&redirect_uri=' + encodeURIComponent(redirect_uri)
          + '&response_type=code';
    });
  } else {
    function checkValidation(d) {
      console.log(d);
      if(d.access_token){
        $('#validateButton').remove();
        div.append($('<div>').text('Got access token: ' + d.access_token));
        $.ajax({
          dataType: "json",
          url: metadata_uri,
          headers: { 'Authorization': 'OAuth ' + d.access_token },
          success: function (d) {
            console.log('access after OAuth:');
            console.log();
          }
        });
      }
    }
    
    console.log('received mailchimp code: ' + urlparam.code);
    $.ajax({
      dataType: "json",
      url: access_token_uri,
      data: {
        grant_type: 'authorization_code',
        client_id: client_id,
        client_secret: secret,
        code: urlparam.code,
        redirect_uri: redirect_uri
      },
      method: 'post',
      success: checkValidation
    });
  }
})();
