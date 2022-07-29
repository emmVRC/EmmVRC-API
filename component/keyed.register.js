const router = require('express').Router();
const Log = require('../core/logger/Log');
// register endpoints
const component = {
    avatar: require('./avatarKEY/router'),
    ban: require('./ban/router'),
    user: require('./userKEY/router'),
}

// bind the path to the router 
// api/dict_key/endpoint
for (const [route, endpoint] of Object.entries(component)) {
    router.use("/" + route, endpoint);
    Log.writeLog("[ KEYED ] Module Loaded: {0}", route);
}


module.exports = router;