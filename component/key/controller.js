const key = require('./key');

const Log = require('../../core/logger/Log');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;
const remoteAddress = require('../../core/util/remoteAddress');

const Key = ((key) => {
    this.key = key.key;
});

Key.issue = (async (req, res) => {
    try {

        res.status(200).send({
            key: await key.issue(remoteAddress(req), req.headers['user-agent'], req.headers['via'] ? req.headers['via'] : "none", (await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id)
                .then((result) => { return result; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError("{0}: {1}", [error.name, error.message]);
        res.status(error.code).send({ error: error.message });
    }
});

Key.destroy = (async (req, res) => {
    try {
        res.status(200).send({
            status: await key.destroy(req.body.key || req.param.key, (await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        console.log(error);

        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Key;
