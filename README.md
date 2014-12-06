dropkit
=======

dropkit is a node.js module for Digital Ocean's REST API.

# Usage:

 npm install --save dropkit

```javascript
 var dropkit = require("dropkit");
 var do = new dropkit("TOKEN");

 //DropKit uses BlueBird and returns promises instead of callbacks.

 do.accounts().then(function(account) {
    console.log(account);
 }).error(function(error) {
    console.log("something bad happened");
 });
```

# API:
```javascript
 do.accounts();

 do.domains();
 do.domain(domainName);
 do.domain().delete(domainName);
 do.domain().create({'name' : 'name.com','ip_address' : '127.0.0.1'});
```

# Dev

1. npm install
2. npm test