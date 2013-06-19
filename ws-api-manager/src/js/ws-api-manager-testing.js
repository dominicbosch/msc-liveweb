/*
 * Test suite for the ws api manager
 */
(function(){
  var libHost = 'http://dominicbosch.github.io/msc-theliveweb/';
  var arrParams = window.location.search.substr(1).split('&'), arrKeyVal;
  var objParams = {};
  for(var i = 0; i < arrParams.length; i++){
    arrKeyVal = arrParams[i].split('=');
    objParams[arrKeyVal[0]] = arrKeyVal[1];
  }
  
  function loadLib(relPath, name, callback){
    $.getJSON(relPath)
    .done(callback)
    .fail(function(o, e){
      $.getJSON(libHost+relPath)
      .done(callback)
      .fail(function(o, e){
        pluginTest.assert(false, 'Retreiving ' + name + ' JSON');
      });
    });
  }
  
  function doesListContain(mainList, subList, exactly){
    if(!mainList || !subList) return false;
    if(exactly && mainList.length!=subList.length) return false;
    for(var i = 0; i < mainList.length; i++){
      var there = false;
      for(var j = 0; j < subList.length; j++){
        if(subList[j] === mainList[i]) there = true;
      }
      if(!there) return false;
    }
    return true;
  }
      
  var formatTest = new UnitTest('Check Plugin Schema Validator', 
    function () {
      if(window.tv4){
        this.assert(true, 'schema validator already loaded');
        //this.assert(tv4.validate(data, schema));
      } else {
        setTimeout(function(){
          formatTest.assert(window.tv4, 'schema validator dynamic load');
        },1000);
      }
    }
  );
  
  var pluginTest = new UnitTest('Load Plugins',
    function () {
      loadLib('json/evernote.json', 'evernote',
        function(obj){
          wsAPI.addApi({obj: obj}, true);
          pluginTest.assert(wsAPI.getApi('evernote'), 'Object plugin Test with evernote');
      });
      
      loadLib('json/google.json', 'google',
        function(obj){
          wsAPI.addApi({text: JSON.stringify(obj)}, true);
          pluginTest.assert(wsAPI.getApi('google'), 'Text plugin Test with google');
      });
      
      wsAPI.addApi({file: 'json/dropbox.json'}, true);
      setTimeout(function(){
        pluginTest.assert(wsAPI.getApi('dropbox'), 'Library File plugin Test with dropbox');
      },1000);
      
      wsAPI.addApi({url: libHost + 'json/mailchimp.json'}, true);
      setTimeout(function(){
        pluginTest.assert(wsAPI.getApi('mailchimp'), 'Url plugin Test with mailchimp');
      },1000);
      
      wsAPI.addApi({obj: probinderapi}, true);
      this.assert(wsAPI.getApi('probinder'), 'Local Object plugin Test with probinder');
    } 
  );
  
  var schemaTest = new UnitTest('Test Plugin Schemas',
    function () {
      schemaTest.assert(wsAPI.hasSchema, 'Schema ready');
      if(wsAPI.hasSchema){
        schemaTest.assert(wsAPI.validateApi(probinderapi, localschema), 'ProBinder API validation');
        loadLib('json/invalid.json', 'invalid',
          function(obj){
            schemaTest.assert(!wsAPI.validateApi(obj, localschema), 'Invalid API rejected');
        });
      } else {
        schemaTest.assert(false, 'Schema not found due to: ' + wsAPI.getSchemaError());
      }
    }
  );
  
  var interfaceTest = new UnitTest('Test API interface',
    function () {
      setTimeout(function(){
        var reqApis = ['probinder', 'mailchimp', 'dropbox', 'google', 'evernote'];
        var allApis = wsAPI.getAllApiPropertyNames();
        if(allApis) {
          interfaceTest.assert(doesListContain(reqApis, allApis), 'All predefined APIs loaded');
        } else interfaceTest.assert(false, 'No APIs loaded!');
        
        var obj = wsAPI.getApi('probinder');
        try {
          interfaceTest.assert(obj, 'API fetching');
          interfaceTest.assert(obj===probinderapi, 'API Identity');
          interfaceTest.assert(obj.name!==null, 'API Name');
          interfaceTest.assert(obj.idname!==null, 'API ID Name');
          interfaceTest.assert(obj.host!==null, 'API Host');
          interfaceTest.assert(obj.authentication!==null, 'API Authentication Type');
          interfaceTest.assert(obj.packages!==null, 'API Packages');
        } catch(e){
          console.log('Some object properties were not present during API Interface test!');
        }
         //TODO thorough API test implementation for all methods 
      },1000);
  
    }
  );
      
  setTimeout(function(){
    UnitTest.run();
  },1000);
  
})();

//TODO appendto needs to to upper level since it is expected to be the same for all entries of the same level
  
var probinderapi = 
{
  "name": "ProBinder API",
  "apiid": "probinder",
  "host": "https://probinder.com/service/",
  "method": "post",
  "authentication": { "credentials": {}},
  // "authentication": { "api-key": {"key":"aff"}},
  // "authentication": { "oauth": {"secret":"aff", "key":"aff"}},
  "packages": {
    "2": {
      "name": "Content",
      "methods": {
        "addcomment": {
          "name": "add comment",
          "parameters": [ { "key": "id" } ]
        },
        "get": {
          "name": "get",
          "parameters": [ { "key": "id" }, { "key": "service" } ]
        },
        "setread": {
          "name": "set read",
          "parameters": [ { "key": "id" } ]
        }
      }
    },
    "26": {
      "name": "Authentication",
      "methods": {
        "userinfo": { "name": "User Info" },
        "login": {
          "name": "Login",
          "parameters": [ { "key": "email" }, { "key": "password" } ]
        }
      }
    },
    "36": {
      "name": "User",
      "methods": {
        "current": {
          "name": "User Info",
          "description": "Retrieves the data of the currently logged in user."
        }
      }
    }
  }
};

var localschema = 
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "WebService Plugin Description Schema",
  "type": "object",
  "required": [ "name",  "apiid", "host", "authentication", "packages" ],
  
  "properties": {
    "name": { "type": "string" },
    "apiid": { "type": "string" },
    "host": { "type": "string" },
    "method": { "type": "string" },
    "authentication": {
      "type": "object",
      "oneOf": [
        { "$ref": "#/definitions/int-oauth" },
        { "$ref": "#/definitions/int-api-key" },
        { "$ref": "#/definitions/int-credentials" },
        { "type": "null" }
      ]
    },
    "urlparameters": {
      "type": "object",
      "additionalProperties": {
        "type": "string"
      }
    },
    "packages": { "$ref": "#/definitions/int-packages" }
  },
  "additionalProperties": false,

  "definitions": {
    "int-oauth" : {
      "type": "object",
      "required": [ "oauth" ],
      "properties": {
        "oauth": {
          "type": "object",
          "required": [ "key", "secret" ],
          "properties": {
            "key": { "type": "string" },
            "secret": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    
    "int-api-key" : {
      "type": "object",
      "required": [ "api-key" ],
      "properties": {
        "api-key": {
          "type": "object",
          "required": [ "key" ],
          "properties": {
            "key": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    
    "int-credentials" : {
      "type": "object",
      "required": [ "credentials" ],
      "properties": {
        "credentials": {
          "type": "object",
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    
    "int-packages" : { 
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": [ "name", "methods" ],
        "properties": {
          "name":  { "type": "string" },
          "description":  { "type": "string" },
          "methods": { "$ref": "#/definitions/int-methods" }
        },
        "additionalProperties": false
      }
    },
    
    "int-methods" : { 
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": [ "name" ],
        "properties": {
          "name":  { "type": "string" },
          "description":  { "type": "string" },
          "parameters":  { "$ref": "#/definitions/int-parameters" }
        },
        "additionalProperties": false
      }
    },
    
    "int-parameters" : {
      "type": "array",
      "items": {
        "type": "object",
        "required": [ "key" ],
        "properties": {
          "key":  { "type": "string" },
          "datatype":  { "type": "string" },
          "optional":  { "type": "boolean" },
          "description":  { "type": "string" }
        },
        "additionalProperties": false
      }
    }
  }
}



