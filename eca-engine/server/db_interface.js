var redis = require("redis"),
    client;
    
function init(db_port){
  if(!db_port) {
    console.trace('ERROR: No DB port defined!');
    return;
  }
  client = redis.createClient(db_port);
  client.on("error", function (err) {
      console.log("DB Error: " + err);
  });
  helloworld();
};


function helloworld() {
  client.set("test", "wow");
  client.get("missingkey", function(err, reply) {
    console.log(reply);
  });
  client.get("test", function(err, reply) {
    console.log(reply);
  });
  client.hmset("hashset", {
    hskey1: 'hsval1',
    hskey2: { user: 'user', pass: 'password' }
    }, function(err, reply) {
      console.log(reply);
  });
  client.hgetall("hashset", function(err, reply) {
    console.log(reply);
  });
}

exports.init = init;
