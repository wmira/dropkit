/*globals require,module */
/* jshint -W097 */
"use strict";


var pms = require("bluebird");
var https = require("https");
var util = require("./util");
//our utils
var HttpOptionCreator = util.HttpOptionCreator;
var toJSON = util.toJSON;
var objToHttpGetParam = util.objToHttpGetParam;

var createPromise = function(params,towrite) {

    return new pms(function (resolve, reject) {
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
        req.on('error', function(e) {
            reject(e);
        });
        //flush it
        req.end();


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
};



domain.prototype.create = function(data) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/domains'}),JSON.stringify(data));
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
var record = function(DropKit) {
    this.dropkit = DropKit;
};

/**
 *
 * https://developers.digitalocean.com/#create-a-new-domain-record
 *
 * @param recordData
 */
record.prototype.create = function(domainName,recordData) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/domains/' + domainName + '/records'}),JSON.stringify(recordData));
};


/**
 * https://developers.digitalocean.com/#update-a-domain-record
 *
 * @param recordId
 * @param newdata
 */
record.prototype.update = function(domainName,recordId,newdata) {
    return createPromise(this.dropkit.createOption({ method: 'PUT' , path: '/v2/domains/' + domainName + '/records/' + recordId}),JSON.stringify(newdata));

};

/**
 *
 * https://developers.digitalocean.com/#delete-a-domain-record
 *
 * @param recordId
 */
record.prototype.delete = function(domainName,recordId) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/domains/' + domainName+ '/records/' + recordId}));

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

    /**
     * https://developers.digitalocean.com/#retrieve-an-existing-domain
     * https://developers.digitalocean.com/#create-a-new-domain
     *
     *
     * @param domainName
     * @returns {domain}
     */
    this.domain = new domain(this);




    /**
     * https://developers.digitalocean.com/#domain-records
     *
     * @param domainName
     * @returns {record}
     */
    this.record = new record(this);


    /**
     *
     *
     * @type {droplet}
     */
    this.droplet = new droplet(this);


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

    return createPromise(this.createOption({ method: 'GET' , path: path}));

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
    return createPromise(this.createOption({method: 'GET', path: path}));

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

};

module.exports = DropKit;