/*globals require,module */
/* jshint -W097 */
"use strict";



var assert = require("assert");
var util = require("../util");


describe('HttpOptionCreator', function(){
    it('should augment option', function(){
        var base = {'name': 'Dropkit'};
        var creator = util.HttpOptionCreator(base);
        var result = creator({'age':12});

        assert.equal(base.name,result.name);
        assert.equal(12,result.age);
    })
});

describe('objToHttpGetParam', function(){
    it('should transform object', function(){
        var obj = {'name': 'Dropkit', 'age': 12};
        var expected = "name=Dropkit&age=12";
        var result =  util.objToHttpGetParam(obj);

        assert.equal(expected,result);

    })
});