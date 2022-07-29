const mysql = require('../database/query');
const Log = require('../logger/Log');

const Secret = ((secret) => {
    this.secret = secret;
});

Secret.retrieve = (async (token_id) => {
    try {
        return await mysql.select([
            'jwt_secret_secret',
            'jwt_secret_expires'
        ], 'jwt_secret', ['jwt_secret_id', '=', token_id]);
    } catch (error) {
        Log.writeError(error);
        return false;
    }
});

Secret.destroy = (async (user_id) => {
    let results = await mysql.count('jwt_secret',
        ['jwt_secret_user_id', '=', user_id]);

    if (results > 0)
        await mysql.delete('jwt_secret',
            ['jwt_secret_user_id', '=', user_id]);
});

Secret.create = (async (token_id, user_id, secret) => {
    const params = {
        id: token_id,
        user_id: user_id,
        secret: secret,
        created: new Date(),
        expires: null,
    };
    try {

        await Secret.destroy(user_id);
        await mysql.insert('jwt_secret', params);

        return params.secret;
    } catch (error) {
        Log.writeError(error);
        throw error;
    }
});

module.exports = Secret;