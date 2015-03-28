/*globals require,module,it,describe */
/* jshint -W097 */
"use strict";
var DropKit =  require("../");

var assert = require("assert");
var client = new DropKit("");

describe('Account Api', function(){
    it('should have proper account api', function(){
        var account = client.account;
        assert.equal("function",typeof account.keys);
        assert.equal("object",typeof account.key);
        assert.equal("function",typeof account.key.update);
        assert.equal("function",typeof account.key.destroy);
    });
});
