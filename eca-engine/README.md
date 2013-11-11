# Modular ECA Server
This folder continues examples of an ECA engine and how certain use cases could be implemented together with a rules language.

Be sure the user which runs the server doesn't have ANY write rights on the server!
Malicious modules could capture or destroy your server! 

The server is started through the [rules_server.js](rules_server.html) module by calling `node rule_server.js`. 


Navigate through the Table of Contents.

TODO's:
- [ ] Redis queue
- [ ] user handling (personal credentials)
- [ ] security in terms of users (private key, login)
- [ ] vm for modules, only give few libraries (no fs!)
- [ ] clean documentation
- [ ] rules generator (provide webpage that is used to create rules dependent on the existing modues)
- [ ] geo location module, test on smartphone
