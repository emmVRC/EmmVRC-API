const mysql = require('../database/query');
const Log = require('../logger/Log');

const Whitelist = ((whitelist) => {
    this.whitelist = whitelist;
});

Whitelist.verify = (async (token) => {
    try {

        const results = await mysql.get('jwt_whitelist',
            ['jwt_whitelist_token', '=', token]);

        if (!results) return false;

        if (results.data.records.length > 0 && results.data.records[0].jwt_whitelist_token === token)
            return JSON.stringify({ results });

        return false;

    } catch (error) {
        Log.writeError(error);
    }

});

Whitelist.add = (async (user_id, token) => {

    const params = {
        id: null,
        user_id: user_id,
        token,
        created_date: new Date()
    };

    try {
        await Whitelist.destroy(user_id);
        return await mysql.insert('jwt_whitelist', params);
    } catch (error) {
        throw error;
    }

});


Whitelist.destroy = (async (user_id) => {

    let results = await mysql.count('jwt_whitelist',
        ['jwt_whitelist_user_id', '=', user_id]);

    if (results > 0)
        await mysql.delete('jwt_whitelist', ['jwt_whitelist_user_id', '=', user_id]);

});

module.exports = Whitelist;