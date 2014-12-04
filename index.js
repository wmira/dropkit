/*globals require,module */
/* jshint -W097 */
"use strict";


var Promise = require("bluebird");
var https = require("https");
var util = require("util");

var HttpOptionCreator = function(baseOption) {

    /**
     * augments the request option with the baseOption
     *
     */
    return function(requestOption) {
        return util._extend(baseOption,requestOption);
    };
}


var toJSON = function(buffer) {
  return JSON.parse(buffer.toString('utf-8'));
};

var DropKit = function(token) {

    var baseOption = {
        hostname: 'api.digitalocean.com',
        port: 443,
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + token
        }
    };

    var createOption = HttpOptionCreator(baseOption);

    this.account = function() {
        return new Promise(function (resolve, reject) {
            var req = https.request(createOption({ method: 'GET' , path: '/v2/account'}),function(res) {
                res.on('data',function(data) {
                    var result = toJSON(data);
                    resolve(result);
                });
            });
            req.end();
        });


    };
};



/**
 * Create a digital ocean droplet instance
 *
 * @param token
 */
DropKit.create = function(token) {
    return new DropKit(token);
};

module.exports = DropKit;