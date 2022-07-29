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

    //TODO: make this resolve the promise so I dont have to other places
    static async verifyPassword(password, storedpassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, storedpassword, function (error, result) {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }

    static async get(where, ...param) {
        try {
            if (typeof where !== "object" || where.length !== 2)
                throw error('Invalid param where wrong length (1) or type looking for type Dict object found: ' + typeof where);

            return await mysql.select(...param, "user", [where[0], '=', where[1]]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async count(where) {
        try {
            if (typeof where !== "object" || where.length !== 2)
                throw error('Invalid param where wrong length (1) or type looking for type Dict object found: ' + typeof where);

            return await mysql.count("user", [where[0], '=', where[1]]);
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
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async register(name, username, password) {

        if (await this.doesExist(username).then((result) => { return result }) !== 0) throw new Error("User already exists");

        try {
            return mysql.insert("user", {
                id: username,
                name: base64.encode(name),
                pin: bcrypt.hashSync(password, config.hash.saltRounds),
                known_aliases: `${base64.encode(name)},`,
                group: 0,
                status: 0,
                created_date: new Date(),
            });
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    //TODO: REDO to make more dynamic like not just username and email but any vals
    static async doesExist(username) {

        if (typeof username === "string")
            username = await mysql.count('user', ['user_id', '=', username])
                .then((result) => { return result })
                .catch((error) => { throw error });

        if (username > 0) return 1;
        return 0;
    }
}


module.exports = User;