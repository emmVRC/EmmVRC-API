const jwt = require('jsonwebtoken');

const whitelist = require('./whitelist');
const crypt = require('./crypt');
const Secret = require('./secret');

const Log = require('../logger/Log');
const mysql = require('../database/query');
const config = require('../config');

//TODO rewrite this crap

const Jsonwebtoken = ((jsonwebtoken) => {
    this.jsonwebtoken = jsonwebtoken;
});

Jsonwebtoken.verify = ((token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, ((error, payload) => {
            if (error) return reject(error);
            resolve(payload);
        }));
    });
});

Jsonwebtoken.create = (async (value) => {
    try {

        const secret = await crypt.bytes(15);

        const signed = jwt.sign(
            { user_id: value },
            secret,
            { expiresIn: config.secrets.jwtExp });

        await Secret.create(signed, value, secret)
            .catch((error) => {
                Log.writeError(error);
                throw new Error('Unable to create secret', error)
            });
        return signed;

    } catch (error) {
        Log.writeError(error);
    }
});

Jsonwebtoken.get = ((headers) => {
    try {
        return headers.authorization.split('Bearer ')[1].trim();
    } catch (error) {
        throw error
    }
});

Jsonwebtoken.payload = (async (token) => {
    const secret = await Secret.retrieve(token)
        .then((result) => {
            return result.data.records[0].jwt_secret_secret;
        }).catch((error) => {
            Log.writeError("invalid token {0}", error);
            throw error;
        });

    const result = await whitelist.verify(token);

    if (!result) throw 'does not exist';

    return Jsonwebtoken.verify(token, secret)
        .then((payload) => {
            //I think this can be ignored becuase it checks the secret from the db
            // mysql.count('user', ['user_id', '=', payload.user_id])
            //     .then(result => {
            //         if (!result.data.count > 0)
            //             throw error('does not exist');

            //         return result;
            //     });

            return payload
        }).catch((error) => {
            Log.writeError(error.message);
            throw 'invalid';
        });
});

//TODO: rewrite also ensure the reissue is there if the user has a valid token and the key/salt has rotated
//rotating tokens with exp  || req.handshake.query.token
Jsonwebtoken.protect = (async (req, res, next) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer '))
        return res.status(401).end();

    const token = bearer.split('Bearer ')[1].trim();

    const secret = await Secret.retrieve(token)
        .then((result) => {
            return result.data.records[0].jwt_secret_secret;
        }).catch((error) => {
            Log.writeError("invalid token {0}", error);
            return null;
        });
    whitelist.verify(token).then(result => {

        if (!result) return res.status(401).end();

        try {
            Jsonwebtoken.verify(token, secret)
                .then((payload) => {
                    mysql.count('user', ['user_id', '=', payload.user_id])
                        .then(result => {
                            if (!result > 0) {
                                return res.status(401).end();
                            }

                            res.locals.user_id = payload.user_id;
                            next();
                        });
                }).catch(async (error) => {

                    // user_id = await mysql.select(['user_id'], 'jwt_whitelist', ['jwt_whitelist_token', '=', token]);
                    // console.log(">>>>>>>>>>", user_id);
                    // await mysql.insert('login', {
                    //     user_id: user_id,
                    //     address: remoteAddress(req),
                    //     agent: req.headers['user-agent'],
                    // });
                    // Jsonwebtoken.issue(user_id);

                    // res.locals.user_id = user_id;
                    // next();
                    Log.writeError(error.message);
                    return res.status(401).end()
                });

        } catch (error) {
            Log.writeError(error);
            return res.status(401).end()
        }

    }).catch(error => {
        Log.writeError(error);
        return res.status(401).end();
    });

});

Jsonwebtoken.issue = ((userid) => {
    return new Promise(async (resolve, reject) => {

        const token = await Jsonwebtoken.create(userid);
        whitelist.add(userid, token)
            .then(results => {
                if (!results) {
                    Log.writeError("error adding token to whitelist");
                    reject('failed');
                }
                resolve(token);
            }).catch(error => {
                Log.writeError(error);
                reject(error);
            });
    });
});

Jsonwebtoken.destroy = (async (token) => {
    try {
        const results = await mysql.count('jwt_whitelist', ['jwt_whitelist_token', '=', token]);
        if (results > 0)
            await mysql.delete('jwt_whitelist', ['jwt_whitelist_token', '=', token]);
    } catch (error) {
        throw error;
    }
});

module.exports = Jsonwebtoken;