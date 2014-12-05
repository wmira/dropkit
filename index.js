/*globals require,module */
/* jshint -W097 */
"use strict";


var Promise = require("bluebird");
var https = require("https");
var util = require("util");



/**
 * augments the request option with the baseOption
 *
 */
var HttpOptionCreator = function(baseOption) {

    return function(requestOption) {
        return util._extend(baseOption, requestOption);
    }
}


var toJSON = function(buffer) {
  return JSON.parse(buffer.toString('utf-8'));
};

var createPromise = function(params,towrite) {

    return new Promise(function (resolve, reject) {
        var req = https.request(params,function(res) {
            var buffer = "";
            //204 is successful delete request
            if ( res.statusCode === 200 || res.statusCode === 204 ) {
                res.on('data', function (chunk) {
                    buffer += chunk;
                });
            } else {
                reject(new Error("Error: Non OK Status Code: " + res.statusCode));
            }
            res.on('error',function(err) {
                reject(err);
            });

            res.on('end',function() {
                resolve(toJSON(buffer));
            });
        });

        if ( towrite ) {
            req.write(towrite);
        }

        //flush it
        req.end();

        req.on('error', function(e) {
            reject(e);
        });
    });
};

var domain = function(DropKit) {
    this.dropkit = DropKit;

    return this;
};

domain.prototype.create = function(name,ipaddress) {
    var tosubmit = {
        name : name,
        ip_address : ipaddress
    };

    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/domains'}),JSON.stringify(tosubmit));

};

domain.prototype.delete = function(name) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/domains/' + name}));
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
    this.createOption = HttpOptionCreator(baseOption);
};

/**
 * Return account info
 *
 * https://developers.digitalocean.com/#get-user-information
 *
 */
DropKit.prototype.accounts = function() {
    return createPromise(this.createOption({ method: 'GET' , path: '/v2/account'}));
};

/**
 * Domains
 *
 * https://developers.digitalocean.com/#list-all-domains
 *
 */
DropKit.prototype.domains = function() {
    return createPromise(this.createOption({ method: 'GET' , path: '/v2/domains'}));
};


/**
 * https://developers.digitalocean.com/#retrieve-an-existing-domain
 * https://developers.digitalocean.com/#create-a-new-domain
 *
 *
 * @param domainName
 * @returns {domain}
 */
DropKit.prototype.domain = function(domainName) {
    if ( domainName ) {
        return createPromise(this.createOption({ method: 'GET' , path: '/v2/domains/' + domainName}))
    } else {
        return new domain(this);
    }
};



module.exports = DropKit;