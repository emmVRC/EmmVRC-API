const APIError = require('../../core/APIError');
const mysql = require('../../core/database/query');
const config = require('../../core/config');
const Log = require('../../core/logger/Log');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');

class Blocked {
    constructor() { }

    static async get(where, ...param) {
        try {
            if (typeof where !== "object" || where.length !== 2)
                throw error('Invalid param where wrong length (1) or type looking for type Dict object found: ' + typeof where);

            return await mysql.select(...param, 'blocked', [where[0], '=', where[1]]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async add(blocker_user_id, target_user_id, expire_date) {
        try {
            if (typeof blocker_user_id !== "string" || typeof target_user_id !== "string" || !blocker_user_id || !target_user_id)
                throw new APIError(authenticationCode.badRequest, authenticationError.missing);

            if (await mysql.count('blocked', [['blocked_target_user_id', '=', target_user_id], ['blocked_blocker_user_id', '=', blocker_user_id]]) > 0)
                return await this.remove(blocker_user_id, target_user_id);

            return await mysql.insert("blocked", {
                blocker_user_id: blocker_user_id,
                target_user_id: target_user_id,
                expire_date: expire_date,
            });
        }
        catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async remove(blocker_user_id, target_user_id) {
        try {
            return await mysql.delete('blocked', [['blocked_blocker_user_id', '=', blocker_user_id], ['blocked_target_user_id', '=', target_user_id]]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = Blocked;
