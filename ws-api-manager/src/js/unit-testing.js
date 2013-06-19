(function(window){
  var arrTests = [];

  var UnitTest = function(title, testFunction){
    if(testFunction) {
      $('#testresults').append('<div>'+title+':</div>');
      this.title = title;
      this.ul = $('<ul></ul>').appendTo($('#testresults'));
      this.test = testFunction;
      arrTests.push(this);
    }
    else console.log('Test function undefined for: ' + title);
  };
  UnitTest.prototype.assert = function( test, description ) {
    var dec = test ? 'pass' : 'fail';
    this.ul.append('<li class="'+dec+'">'+dec.toUpperCase()+': '+description+'</li>');  
  };
  
  UnitTest.run = function() {
    for(var i = 0; i < arrTests.length; i++){ 
      try {
        arrTests[i].test();
      } catch(e){
        var msg = 'Testing encountered error in '+arrTests[i].title+' (i='+i+')';
        if(e) msg += ': ' + e.message; 
        console.log(msg);
      }
    }
  }
  
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = UnitTest;
  } else {
    window.UnitTest = UnitTest;
  }
})(window);
  
  