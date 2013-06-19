/*
 * Interface between webpage and Webservice API Manager
 */
(function(){
  var selWs=selPkg=selMthd=null;
  function nel(tag, opt){
    return $('<'+tag+'>',opt);
  }
  
  function createOptions(lst, selector){
    $(selector + ' option').remove();
    var i = 0, sel = null;
    if(lst) {
      for(var nm in lst){
        if(i++ == 0) sel = nm;
        if(lst.hasOwnProperty(nm)) {
          $(selector).append(nel('option', {objid: nm, text: lst[nm].name}));
        }
      }
    }
    return sel;
  }
  var ul = nel('ul');
  $('#apimgr').append(ul);
  ul.append(nel('li', {text: 'Unit Tests'}).attr('class', 'link').click(function(){ window.location = 'test'; }));
  ul.append(nel('li', {text: 'JSONP'}).attr('class', 'link').click(function(){ window.location = 'jsonp'; }));
  ul.append(nel('li', {text: 'Google'}).attr('class', 'link').click(function(){ window.location = 'google'; }));
  ul.append(nel('li', {text: 'Last.fm'}).attr('class', 'link').click(function(){ window.location = 'lastfm'; }));
  ul.append(nel('li', {text: 'Mailchimp'}).attr('class', 'link').click(function(){ window.location = 'mailchimp'; }));
  ul.append(nel('li', {text: 'Evernote'}).attr('class', 'link').click(function(){ window.location = 'evernote'; }));
  $('#apimgr').append(nel('div', {text: 'ProBinder API Interface'}).attr('class', 'header'));
  $('#apimgr').append(nel('div', {text: 'Select Webservice API:'}))
    .append(nel('select', {id: 'wsselect'})).append('<br/>')
    .append(nel('select', {id: 'pkgselect'})).append('<br/>')
    .append(nel('select', {id: 'mthdselect'}));

  $('#wsselect').change(function(e){
    $("option:selected", this).each(function() {
      selWs = $(this).attr('objid');
      reloadPackageSelector(selWs);
    });
  });
  $('#pkgselect').change(function(e){
    $("option:selected", this).each(function() {
      reloadMethodSelector(selWs, $(this).attr('objid'));
    });
  });
  $('#mthdselect').change(function(e){
    $("option:selected", this).each(function() {
      console.log($(this).attr('objid'));
    });
  });

  function reloadWebserviceSelector(){
    var listApis = wsAPI.getAllApis();
    selWs = createOptions(listApis, '#wsselect');
    try { reloadPackageSelector(selWs); } catch(e) {}
  }
  
  function reloadPackageSelector(idname){
    selPkg = createOptions(wsAPI.getAllPackages(idname), '#pkgselect');
    try { reloadMethodSelector(idname, selPkg); } catch(e) {}
  }
  
  function reloadMethodSelector(idname, packageid){
    selMthd = createOptions(wsAPI.getAllPackageMethods(idname, packageid), '#mthdselect');
    // try { reloadMethodSelector(selected); } catch(e) {}
    
  }
  
  function afterWsAPIinit(){
    reloadWebserviceSelector();
  }
  
  wsAPI.init(afterWsAPIinit);
})();

  