const uuid = require('uuid');

const APIError = require('../../core/APIError');
const bcrypt = require('../../core/authentication/bcrypt');
const mysql = require('../../core/database/query');
const config = require('../../core/config');
const Log = require('../../core/logger/Log');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const base64 = require('../../core/util/base64');

class User {
    constructor() { }
    static async get(user_id) {
        try {
            return await mysql.select(['avatar_id', 'avatar_name'], 'avatar INNER JOIN relation_user_avatar ON avatar.avatar_id = relation_user_avatar.relation_user_avatar_avatar_id', ['relation_user_avatar.relation_user_avatar_user_id', '=', user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async update(data, where) {
        try {
            if (typeof where !== "object" || where.length < 2)
                throw 'Invalid param where wrong length (1) or type looking for type Dict object found: ' + typeof where;
            if (typeof data !== "object")
                throw 'Invalid param data looking for type Dict object found: ' + typeof data;

            return await mysql.update('user', data, where);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async changePassword(password, user_id) {
        try {
            await this.update({ pin: bcrypt.hashSync(password, config.hash.saltRounds) }, ['user_id', '=', user_id]);
            await mysql.delete('login_key', ['login_key_user_id', '=', user_id]);
            await mysql.delete('jwt_whitelist', ['jwt_whitelist_user_id', '=', user_id]);
            await mysql.delete('jwt_secret', ['jwt_secret_user_id', '=', user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async transfer(old_user_id, user_id) {

        try {
            return mysql.update('relation_user_avatar', { user_id: user_id }, ['relation_user_avatar_user_id', '=', old_user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
    static async delete(user_id) {
        try {
            await mysql.delete('relation_user_avatar', ['relation_user_avatar_user_id', '=', user_id]);
            await mysql.delete('user', ['user_id', '=', user_id]);
            await mysql.delete('login', ['login_user_id', '=', user_id]);
            await mysql.delete('login_key', ['login_key_user_id', '=', user_id]);
            await mysql.delete('jwt_whitelist', ['jwt_whitelist_user_id', '=', user_id]);
            await mysql.delete('jwt_secret', ['jwt_secret_user_id', '=', user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}


module.exports = User;
