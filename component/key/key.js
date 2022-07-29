const uuid = require('uuid');

const mysql = require('../../core/database/query');
const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');
const authentication = require('../../core/authentication').key;
const authenticationCode = require('../../core/authentication/authenticationCode');
const authenticationError = require('../../core/authentication/authenticationError');
const crypt = require('../../core/authentication/crypt');
const config = require('../../core/config');

//TODO Tags 
//TODO change to Joins
class Key {
    static async issue(remoteAddress, agent, proxy, user_id) {

        const access = await mysql.select(['user_group'], 'user', ['user_id', '=', user_id]);

        if (access.data.records.length === 0 || access.data.records[0].user_group != 3)
            throw new APIError(authenticationCode.unauthorized, authenticationError.unauthorized);

        return await authentication.create()
            .then(async (result) => {
                const hash_key = await crypt.hash(result, config.key.salt);
                const request = {
                    id: hash_key.hash,
                    requestor_id: user_id,
                    agent: agent,
                    remote_address: remoteAddress,
                    remote_proxy: proxy,
                    created: new Date(),
                };
                mysql.insert('api_key_request', request);
                return result;
            })
            .catch((error) => {
                console.log(error);

                Log.writeError(error);
                throw new APIError(authenticationCode.internal, authenticationError.internal);
            });
    }

    static async destroy(key, user_id) {
        if (!key || !user_id)
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        try {
            return mysql.q("UPDATE `api_key`\
                SET api_key.api_key_active = 0\
                LEFT INNER JOIN `api_key_request`\
                WHERE api_key.api_key_key = ?\
                AND ( api_key_request.api_key_request_id = ? AND api_key_request.api_key_requestor_id = ? )",
                [key, key, user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = Key;