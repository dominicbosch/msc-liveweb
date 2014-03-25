
  function fetchUserObjectsAsync( arrNames, cbAnswer ){
    var semaphore = arrNames.length,
    objUsers = {},
    fGetUserAsync = function( name, cbLocal ){
      db.getUser(name, cbLocal);
    },
    fJoin = function( uName ) {
      return function( err, obj ) {
        --semaphore
        if( err || !obj ) return;
        objUsers[ uName ] = obj;
        if( semaphore === 0 ){
          cbAnswer( null, objReplies );
        }
      }
    };
    
    for( var name in arrNames ){
      fGetUserAsync( user, fJoin( name ));
    }
  }
