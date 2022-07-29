const mysql = require('../database/query');
const Log = require('../logger/Log');
const crypt = require('./crypt');

const config = require('../../core/config');

//TODO: refactor file a lil
const Key = ((key) => {
    this.key = key;
});

Key.protect = (async (req, res, next) => {
    if (await Key.verify(req.params.apikey)) {
        next();
    }
    else {
        Log.writeError("invalid key {0}", req.params.apikey);
        return res.status(401).end();
    }
});

Key.create = ((request) => {
    return new Promise(async (resolve, reject) => {
        await Key.issue(request)
            .then((results) => {
                if (!results)
                    reject('failed');
                resolve(results);
            }).catch((error) => {
                Log.writeError(error);
                throw error;
            });
    });
});

Key.issue = (async () => {
    const key = await crypt.bytes(45)
    const hash_key = await crypt.hash(key, config.key.salt);

    const params = {
        key: hash_key.hash,
        active: true,
        expires_date: null,
        created_date: new Date()
    };
    try {
        await mysql.insert('api_key', params);
        return key;
    } catch (error) {
        Log.writeError(error);
        throw error;
    }
});

Key.verify = (async (key) => {
    let results = null;
    key = await crypt.hash(key, config.key.salt);

    try {
        results = (await mysql.get('api_key', ['api_key_key', '=', key.hash])).data.records;
    } catch (error) {
        Log.writeError(error);
        return false;
    }

    if (results != undefined && results.length > 0)
        if ((results[0].api_key_expires > Date.now() || results[0].api_key_expires == null) && results[0].api_key_active)
            return true;
    return false;
});

module.exports = Key;