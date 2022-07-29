const fs = require('fs');
const privateKey = fs.readFileSync('privkey.pem')
const certificate = fs.readFileSync('cert.pem')

var credentials = { key: privateKey, cert: certificate };

const express = require('express');
const config = require('./config');
const Log = require('./logger/Log');
const redis = require('./database/redis');
const compression = require('compression');
const app = express();
const https = require('https').createServer(credentials, app);


Log.writeLog("Initializing Server . . . ");

app.use(compression());
require('../middleware')(app);

Log.writeLog("Loading REST API Modules . . . ");
app.use('/api', require('./router'));

require('./avatarRevalidator');

exports.start = (async () => {
    try {
        redis.start();
        https.listen(config.port, () => {
            Log.writeLog("Server running! PORT: {0}", config.port);
        });

    } catch (error) {
        console.log(error);
        Log.writeError('Server failed to start {0}', error)
    }
});
