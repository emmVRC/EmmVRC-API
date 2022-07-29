const mysql = require('../database/query');
const Log = require('../logger/Log');
const crypt = require('./crypt');

const config = require('../../core/config');

//TODO: refactor file a lil
const LoginKey = ((loginKey) => {
    this.loginKey = loginKey;
});

LoginKey.create = ((request) => {
    return new Promise(async (resolve, reject) => {
        await LoginKey.issue(request)
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

LoginKey.issue = (async (user_id) => {
    const hash_key = await crypt.hash(await crypt.bytes(45), config.key.salt2);

    const params = {
        key: hash_key.hash,
        user_id: user_id,
        created_date: new Date()
    };
    try {
        await mysql.delete('login_key', ['login_key_user_id', '=', user_id]);
        await mysql.insert('login_key', params);

        return params.key;
    } catch (error) {
        Log.writeError(error);
        throw error;
    }
});

LoginKey.verify = (async (key) => {
    try {
        if (await mysql.count('login_key', ['login_key_key', '=', key]) != 0)
            return true;
        return false;
    } catch (error) {
        Log.writeError(error);
        return false;
    }
});

module.exports = LoginKey;