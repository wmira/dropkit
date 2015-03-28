/*globals require,module */
/* jshint -W097 */
"use strict";


var pms = require("bluebird");
var https = require("https");
var util = require("./util");
//our utils
var httpOptionCreator = util.HttpOptionCreator;
var toJSON = util.toJSON;
var objToHttpGetParam = util.objToHttpGetParam;

var createPromise = function(params,towrite) {

    return new pms(function (resolve, reject) {
        var req = https.request(params,function(res) {

            res.setEncoding('utf8');
            var buffer = "";

            res.on('data', function (chunk) {
                buffer += chunk;
            });

            res.on('error',function(err) {
                reject(err);
            });

            res.on('end',function() {

                if ( res.statusCode === 200 || res.statusCode === 204 || res.statusCode === 201 ) {
                    if ( buffer ) {
                        resolve(toJSON(buffer));
                    } else {
                        resolve();
                    }
                } else {
                    if ( buffer ) {
                        reject({statusCode: res.statusCode, res:toJSON(buffer)});
                    } else {
                        reject({statusCode: res.statusCode});
                    }
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
record.prototype.update = function(domainName,recordId,name) {
    return createPromise(this.dropkit.createOption({ method: 'PUT' , path: '/v2/domains/' + domainName + '/records/' + recordId}),JSON.stringify({name: name}));

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
 * Image https://developers.digitalocean.com/#images
 *
 * @param DropKit
 * @returns {image}
 */
var image = function(DropKit) {
    this.dropkit = DropKit;
    return this;
};


/**
 * Update the name of a droplet
 * https://developers.digitalocean.com/#update-an-image
 *
 */
image.prototype.update = function(imageId,newName) {
    return createPromise(this.dropkit.createOption({ method: 'PUT' , path: '/v2/images/' + imageId }),JSON.stringify({name: newName}));
};

/**
 * Who would do such
 * https://developers.digitalocean.com/#delete-an-image
 *
 * @param imageId
 */
image.prototype.delete   = function(imageId) {
    return createPromise(this.dropkit.createOption({ method: 'DELETE' , path: '/v2/images/' + imageId }));
};

/**
 * https://developers.digitalocean.com/#transfer-an-image
 *
 * @param imageId
 * @param type
 * @param region
 */
image.prototype.transfer   = function(imageId,region) {
    return createPromise(this.dropkit.createOption({ method: 'POST' , path: '/v2/images/' + imageId + "/actions" }),JSON.stringify({type: "transfer",region: region}));
};

image.prototype.action   = function(imageId,imageActionId) {
    return createPromise(this.dropkit.createOption({ method: 'GET' , path: '/v2/images/' + imageId + "/actions/" +imageActionId}));
};

var key = function(DropKit) {
    this.dropkit = DropKit;
    return this;
};

/**
 * Update the name of a key
 * https://developers.digitalocean.com/#update-a-key
 *
 * @param keyIdOrFingerPrint
 * @param name
 */
key.prototype.update  = function(keyIdOrFingerPrint,name) {
    return createPromise(this.dropkit.createOption({method: "PUT", path: "/v2/account/keys/" + keyIdOrFingerPrint}), JSON.stringify({name: name}));
};

/**
 *
 * https://developers.digitalocean.com/#destroy-a-key
 *
 * @param keyIdOrFingerPrint
 */
key.prototype.destroy  = function(keyIdOrFingerPrint) {
    return createPromise(this.dropkit.createOption({method: "DELETE", path: "/v2/account/keys/" + keyIdOrFingerPrint}));
};

/**
 * Account related stuff
 *
 * @param DropKit
 * @returns {account}
 */
var account = function(DropKit) {
    this.dropkit = DropKit;

    /**
     * Key operations
     *
     * @type {key}
     */
    this.key = new key(this.dropkit);

    return this;
};




/**
 * https://developers.digitalocean.com/#create-a-new-key
 *
 * @param requestParameter
 */
account.prototype.keys = function(request) {


    if ( request ) {
        if ( typeof request === "number" || typeof request === "string" ) {
            return createPromise(this.dropkit.createOption({method: "GET", path: "/v2/account/keys/" + request}));
        } else {
            return createPromise(this.dropkit.createOption({method: "POST", path: "/v2/account/keys"}), JSON.stringify(request));
        }

    } else {
        return createPromise(this.dropkit.createOption({ method: "GET" , path: "/v2/account/keys"}));
    }

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
    this.createOption = httpOptionCreator(baseOption);

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
     * https://developers.digitalocean.com/#images
     *
     * @type {droplet}
     */
    this.droplet = new droplet(this);

    /**
     * Image
     *
     * @type {image}
     */
    this.image = new image(this);

    /**
     * All operations within an account
     * https://developers.digitalocean.com/#ssh-keys
     *
     *
     * @type {account}
     */
    this.account = new account(this);
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
    var path = '/v2/actions';
    if ( actionId ) {
        if ( typeof actionId === "string" || typeof actionId === "number" ) {
            path += "/" + actionId; //requesting /actions/Id
        } else {
            path += "?" + objToHttpGetParam(actionId);
        }
    }
    return createPromise(this.createOption({method: 'GET', path: path}));
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
 * Images
 * https://developers.digitalocean.com/#images
 *
 *
 * @param domainName
 */
DropKit.prototype.images = function(imageParameter) {
    var path = "/v2/images";
    if ( imageParameter ) {
        if ( typeof imageParameter === "string" || typeof imageParameter === "number") {
            path += "/" + imageParameter;
        }  else {
            //assume its a freaking object
            if ( imageParameter.type ) {
                path += "?" + objToHttpGetParam(imageParameter);
            }
        }
    }

    return createPromise(this.createOption({ method: 'GET' , path: path}));

};

/**
 *
 * https://developers.digitalocean.com/#domain-records
 *
 * TODO: this should probably live inside domain
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
    return createPromise(this.createOption({method: 'GET', path: path}));

};

/**
 *
 * https://developers.digitalocean.com/#list-droplet-upgrades
 *
 */
DropKit.prototype.droplet_upgrades = function() {

    return createPromise(this.createOption({ method: 'GET' , path: '/v2/droplet_upgrades'}));

};


/**
 * https://developers.digitalocean.com/#regions
 *
 */
DropKit.prototype.regions = function() {
    return createPromise(this.createOption({ method: 'GET' , path: "/v2/regions"}));
};


/**
 * https://developers.digitalocean.com/#sizes
 *
 */
DropKit.prototype.sizes = function() {
    return createPromise(this.createOption({ method: 'GET' , path: "/v2/sizes"}));
};



module.exports = DropKit;