/*globals require,module */
/* jshint -W097 */
"use strict";

var util = require("util");


module.exports = {
    HttpOptionCreator : function(baseOption) {

        return function(requestOption) {
            return util._extend(baseOption, requestOption);
        }
    },

    toJSON : function(buffer) {
        return JSON.parse(buffer.toString('utf-8'));
    },

    objToHttpGetParam : function(obj) {
        var key,params = [];
        for ( key in obj ) {
            if ( obj.hasOwnProperty(key) ) {
                params.push(key + "=" + obj[key]);
            }
        }
        return params.join("&");
    }
};