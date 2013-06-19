/*
 * 
 */

(function (window) {
  
  var wsApiManager = (function(){
    var version = 0.1;
    var libHost = 'http://dominicbosch.github.io/msc-liveweb/';
    var pubFunc = {}, listApis = {}, objSchema = null, errSchema = null;
    var readyTv4 = false;
    var arrDefaultAPIs = [ 'json/probinder.json', 'json/evernote.json' ];
    
    function requestJSON (url, data, callbackDone){
      $.getJSON(url, data)
        .done(callbackDone)
        .fail(function(o, e){
          // if(document.URL.substring(0, 8) === 'file:///'){
          throw new Error("Failed to fetch JSON resource (state: " + o.state() + "). Is the resource address'" 
            + url + "' correct? Did you run it locally in a browser that doesn't "
            + "allow remote requests when opening a file system location (e.g. Chrome)? Does the remote server "
            + "allow cross origin calls (i.e. is your host in the 'Access-Control-Allow-Origin' header response "
            + "from the remote host)?");
      });
    }
    
    function getLibraryScript (relPath, callbackDone, callbackFail){
      $.getScript(relPath).done(callbackDone).fail(function() {
        $.getScript(libHost + relPath).done(callbackDone).fail(callbackFail);
      });
    }
    
    function getLibraryFile (relPath, callbackDone, callbackFail){
      $.getJSON(relPath).done(callbackDone).fail(function() {
        $.getJSON(libHost + relPath).done(callbackDone).fail(callbackFail);
      });
    }
    
    getLibraryFile('json/api-schema.json',
      function(data) {
        objSchema = data;
        console.log('fetched schema');
        pubFunc.hasSchema = true;
        if(window.tv4) readyTv4 = true;
      },
      function(o, e) {
        errSchema = e;
      }
    );
    
    if(!window.tv4) {
      getLibraryScript('js/tv4.js',
        function() { if(objSchema) readyTv4 = true; },
        function() { console.log('Failed loading tiny validator for JSON schemas');
      });
    }
    
    pubFunc.init = function (cbSuccess, cbStepDone, cbStepFail){
      var numLoadedDefaultAPIs = 0;
      for(var i = 0; i < arrDefaultAPIs.length; i++){
        getLibraryFile(arrDefaultAPIs[i], 
          function(data) {
            pubFunc.addApiObject(data, true); //FIXME true has to go away as soon as all default libraries have proper form!
            if(cbStepDone) cbStepDone.call(data);
            if(++numLoadedDefaultAPIs == arrDefaultAPIs.length) cbSuccess.call();
          }
        , cbStepFail);
      }
    }
    
    pubFunc.getSchema = function(){
      return objSchema;
    }
    
    pubFunc.getSchemaError = function(){
      return errSchema;
    }
    
    pubFunc.addApiObject = function(objApi, noValidation){
      try {
        if(readyTv4 && !noValidation) {
          if(tv4.validate(objApi, objSchema)) {
            listApis[objApi.apiid] = objApi;
            console.log('Adding API interface that passed the schema check');
          }
          else console.log('API schema validation failed for: ' + objApi.name);
        }
        else {
          listApis[objApi.apiid] = objApi;
          console.log('Adding API interface without schema check');
        }
      } catch (e) {
        console.log('Adding API interfacd failed: ' + e.message);
      }
    }
    
    pubFunc.addApi = function(args, noValidation){
      if(args){
        if(args.obj) wsApiManager.addApiObject(args.obj, noValidation);
        else if(args.file) getLibraryFile(args.file, function(objApi){ wsApiManager.addApiObject(objApi, noValidation); });
        else if(args.url) requestJSON(args.url, args.params, function(objApi){ wsApiManager.addApiObject(objApi, noValidation); });
        else if(args.text) wsApiManager.addApiObject($.parseJSON(args.text), noValidation);
      }
    }

    pubFunc.validateApi = function(objApi, objSchema){ 
      if(readyTv4) return tv4.validate(objApi, objSchema);
      else return null;
    }
    
    pubFunc.getAllApis = function(){ return listApis; }
    
    pubFunc.getAllApiNames = function(){
      var arrNames = []; 
      for(var nm in listApis){
        if(listApis.hasOwnProperty(nm)) {
          arrNames.push(listApis[nm].name);
        }
      }
      return arrNames;
    }
    
    pubFunc.getAllApiPropertyNames = function(){ return Object.keys(listApis); }
    
    pubFunc.getApi = function(apiid){ return listApis[apiid]; }
    
    pubFunc.getAllPackages = function(apiid){
      try {
        return listApis[apiid].packages;
      } catch (e) {
        console.log('api "'+apiid+'" packages not found: '+e.message);
      }
    }
    
    pubFunc.getAllPackageNames = function(apiid){
      try {
        var pkgs = pubFunc.getAllPackages(apiid);
        var pkgnames = [];
        for(var i = 0; i < pkgs.length; i++){
          pkgnames.push(pkgs[i].name);
        }
        return pkgnames;
      } catch (e) {
        console.log('api "'+apiid+'" package names not found: '+e.message);
      }
    }
    
    pubFunc.getPackage = function(apiid, packageid){
      try {
        return pubFunc.getAllPackages(apiid)[packageid];
      } catch (e) {
        console.log('api "'+apiid+'" package "'+packageid+'" not found: ' + e.message);
      }
    }
    
    pubFunc.getAllPackageMethods = function(apiid, packageid){
      try {
        return pubFunc.getPackage(apiid, packageid).methods;
      } catch (e) {
        console.log('api "'+apiid+'" package "'+packageid+'" methods not found: ' + e.message);
      }
    }
    
    pubFunc.getMethod = function(apiid, packageid, methodid){
      try {
        return pubFunc.getAllPackageMethods(apiid, packageid)[methodid];
      } catch (e) {
        console.log('api "'+apiid+'" package "'+packageid+'" method "'+methodid+'" not found: ' + e.message);
      }
    }
    
    pubFunc.call = function(params){
      try {
        var callNode;
        if(params.methodid) callNode = pubFunc.getMethod(params.apiid, params.packageid, params.methodid);
        else if(params.packageid) callNode = pubFunc.getPackage(params.apiid, params.packageid);
        else if(params.apiid) callNode = pubFunc.getApi(params.apiid);
        else return null;
        console.log(callNode);
        var n = pubFunc.getApi(params.apiid);
        console.log(n);
        requestJSON(n.host + [params.packageid,params.methodid].join('/'), params.parameters, function(data){
          console.log('received');
          console.log(data);
        });
      } catch (e) {
        console.log('Invalid call: ' + e.message);
        console.log(params);
      }
    }
    
    return pubFunc;
  }());

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = wsApiManager;
  } else {
    window.wsAPI = wsApiManager;
  }
}(window));

