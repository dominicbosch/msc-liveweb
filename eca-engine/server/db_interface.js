var redis = require("redis"),
    client = redis.createClient();
    
client.on("error", function (err) {
    console.log("DB Error: " + err);
});

client.set("test", "wow");

client.get("missingkey", function(err, reply) {
    // reply is null when the key is missing
    console.log(reply);
});

client.get("test", function(err, reply) {
    // reply is null when the key is missing
    console.log(reply);
});