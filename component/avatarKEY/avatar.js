const APIError = require('../../core/APIError');
const mysql = require('../../core/database/query');
const Log = require('../../core/logger/Log');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const base64 = require('../../core/util/base64');
const redis = require('../../core/database/redis');

class Avatar {
    constructor() { }

    static async get(where) {
        // if (where.length === 2)
        //     where = [where[0], '=', where[1]]
        try {
            return mysql.get('avatar', [where[0], '=', where[2]]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async old() {
        try {
            return mysql.q('SELECT * FROM avatar WHERE avatar_updated_date < CURDATE() OR avatar_updated_date IS NULL LIMIT 2048')
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async update(object, avatar_id) {

        if (typeof object != "object" || !avatar_id)
            throw new APIError(authenticationCode.missing, authenticationError.missing);

        try {
            let condition = '='
            if (typeof avatar_id === "object")
                condition = "IN";

            return mysql.update('avatar', object, ['avatar_id', condition, avatar_id]);
        } catch (error) {
            console.log(error);

            throw new APIError(200, authenticationError.exists);
        }
    }
    static async blacklist(target_author_id) {

        if (!target_author_id)
            throw new APIError(authenticationCode.missing, authenticationError.missing);

        try {
            return mysql.insert("avatar_author_blacklist", {
                author_id: target_author_id,
            });
        } catch (error) {
            console.log(error);

            throw new APIError(200, authenticationError.exists);
        }
    }
    static async reload() {

        try {
            await redis.flushall();
            await redis.fill();
        } catch (error) {
            console.log(error);

            throw new APIError(200, authenticationError.exists);
        }
    }
}

module.exports = Avatar;
