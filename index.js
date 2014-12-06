/*globals require,module */
/* jshint -W097 */
"use strict";


var Promise = require("bluebird");
var https = require("https");
var util = require("util");
var dutil = require("./util");
//our utils
var HttpOptionCreator = dutil.HttpOptionCreator;
var toJSON = dutil.toJSON;
var objToHttpGetParam = dutil.objToHttpGetParam;

var createPromise = function(params,towrite) {
    console.log(params);
    return new Promise(function (resolve, reject) {
        var req = https.request(params,function(res) {
            res.setEncoding('utf8');
            var buffer = "";
            //204 is successful delete request,201 is created
            if ( res.statusCode === 200 || res.statusCode === 204 || res.statusCode === 201 ) {
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
                if ( buffer ) {
                    resolve(toJSON(buffer));
                } else {
                    resolve();
                }
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


/**
 * Domain
 *
 * @param DropKit
 * @returns {domain}
 */
var domain = function(DropKit) {
    this.dropkit = DropKit;
    return this;
};



domain.prototype.create = function(name,ipaddress) {
    var tosubmit = {
        "name" : name,
        "ip_address" : ipaddress
    };

    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/domains'}),JSON.stringify(tosubmit));

};

domain.prototype.delete = function(name) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/domains/' + name}));
};

/**
 * https://developers.digitalocean.com/#domain-records
 *
 *
 * @param domainName
 * @param DropKit
 */
var record = function(domainName,DropKit) {
    this.name = domainName;
    this.dropkit = DropKit;
};

/**
 *
 * https://developers.digitalocean.com/#create-a-new-domain-record
 *
 * @param recordData
 */
record.prototype.create = function(recordData) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/domains/' + this.name + '/records'}),JSON.stringify(recordData));
};


/**
 * https://developers.digitalocean.com/#update-a-domain-record
 *
 * @param recordId
 * @param newdata
 */
record.prototype.update = function(recordId,newdata) {
    return createPromise(this.dropkit.createOption({ method: 'PUT' , path: '/v2/domains/' + this.name + '/records/' + recordId}),JSON.stringify(newdata));

};

/**
 *
 * https://developers.digitalocean.com/#delete-a-domain-record
 *
 * @param recordId
 */
record.prototype.delete = function(recordId) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/domains/' + this.name + '/records/' + recordId}));

};

/**
 * https://developers.digitalocean.com/#droplets
 *
 * @param DropKit
 * @returns {droplet}
 */
var droplet = function(DropKit) {
    this.dropkit = DropKit;
    return this;
};

droplet.prototype.create = function(droplet) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/droplets'}),JSON.stringify(droplet));
};

droplet.prototype.kernels = function(dropletId) {
    return createPromise(this.dropkit.createOption({ method: 'GET' , path: '/v2/droplets/' + dropletId + '/kernels'}));
};
droplet.prototype.snapshots = function(dropletId) {
    return createPromise(this.dropkit.createOption({ method: 'GET' , path: '/v2/droplets/' + dropletId + '/snapshots'}));
};
droplet.prototype.backups = function(dropletId) {
    return createPromise(this.dropkit.createOption({ method: 'GET' , path: '/v2/droplets/' + dropletId + '/backups'}));
};

droplet.prototype.delete = function(dropletId) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/droplets/' + dropletId}));
};

/**
 * https://developers.digitalocean.com/#droplet-actions
 *
 * @param dropletId
 * @param action
 */
droplet.prototype.action = function(dropletId,action) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/droplets/' + dropletId}),JSON.stringify({type: action}));
};

/**
 * Main dropkit obj
 *
 * @param token
 * @constructor
 */
var DropKit = function(token) {

    var baseOption = {
        hostname: 'api.digitalocean.com',
        port: 443,
        headers: {
            "Content-Type" : "application/json; charset=utf-8",
            "Authorization" : 'Bearer ' + token
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
 * https://developers.digitalocean.com/#actions
 *
 * @param actionId
 */
DropKit.prototype.actions = function(actionId) {

    if ( actionId ) {
        if ( typeof actionId === "string" ) { //FIXME we probably should also check for number
            return createPromise(this.createOption({method: 'GET', path: '/v2/actions/' + actionId}));
        } else {
            return createPromise(this.createOption({method: 'GET', path: '/v2/actions?' + objToHttpGetParam(actionId)}));
        }
    } else {
        return createPromise(this.createOption({method: 'GET', path: '/v2/actions'}));
    }
};

/**
 * Domains
 *
 * https://developers.digitalocean.com/#list-all-domains
 *
 */
DropKit.prototype.domains = function(domainName) {
    var path = "/v2/domains" + (domainName ? ("/" + domainName) : "" );

    return createPromise(this.createOption({ method: 'GET' , path: path}))

};


/**
 *
 * https://developers.digitalocean.com/#domain-records
 *
 *
 * @param domainName
 * @param recordId
 */
DropKit.prototype.records = function(domainName,recordId) {
    var path = "/v2/domains/" + domainName  + "/records" + ( recordId ? ( "/" + recordId) : "");
    return createPromise(this.createOption({method: 'GET', path: path}))

};




/**
 * https://developers.digitalocean.com/#retrieve-an-existing-domain
 * https://developers.digitalocean.com/#create-a-new-domain
 *
 *
 * @param domainName
 * @returns {domain}
 */
DropKit.prototype.domain = function() {
    return new domain(this);
};

/**
 * https://developers.digitalocean.com/#domain-records
 *
 * @param domainName
 * @returns {record}
 */
DropKit.prototype.record = function(domainName) {
    return new record(domainName,this.dropkit);
};

/**
 * https://developers.digitalocean.com/#droplets
 *
 * @param id
 */
DropKit.prototype.droplets = function(id) {
    var path = '/v2/droplets' + (id ? '/' + id : '') ;
    return createPromise(this.createOption({method: 'GET', path: path}))

};
DropKit.prototype.droplet = function() {
    return new droplet(this.dropkit); //FIXME, we should just let this be static
};
/**
 *
 * https://developers.digitalocean.com/#list-droplet-upgrades
 *
 */
DropKit.prototype.droplet_upgrades = function() {

    return createPromise(this.dropkit.createOption({ method: 'GET' , path: '/v2/droplet_upgrades'}));

};

DropKit.prototype.keys = function(keyIdOrFingerPrint) {
    var path = '/v2/account/keys' + ( keyIdOrFingerPrint ? keyIdOrFingerPrint : '/' + keyIdOrFingerPrint);
    return createPromise(this.dropkit.createOption({ method: 'GET' , path: path}));

}

module.exports = DropKit;