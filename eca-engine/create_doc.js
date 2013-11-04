var groc = require('groc');

groc.CLI([
  "README.md",
  "server/*.js",
  "server/mod_actions/**/*.js",
  "server/mod_events/**/*.js",
  "server/rules/*.json"
  ],
  function(error) {
    if (error) {
      process.exit(1);
    }
  }
);
