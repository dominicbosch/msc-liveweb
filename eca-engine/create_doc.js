var groc = require('groc');
/*
 * # groc Documentation
 * Create the documentation to be displayed through the webserver.
 */
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
