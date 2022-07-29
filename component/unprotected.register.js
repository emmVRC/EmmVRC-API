const router = require('express').Router();
const Log = require('../core/logger/Log');

//put into keyed
// register endpoints
const component = {
    authentication: require('./authentication/router'),
    count: require('./count/router'),
    donor: require('./donor/router'),
}

// bind the path to the router 
// api/dict_key/endpoint

for (const [route, endpoint] of Object.entries(component)) {
    router.use("/" + route, endpoint);
    Log.writeLog("[ UNPROTECTED ] Module Loaded: {0}", route);
}

module.exports = router;