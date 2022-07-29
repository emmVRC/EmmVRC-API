const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

const user = require('./user');

//TODO: use and http code and string file for sending errors

const User = ((user) => {
    this.user = user.user;
});

User.default = ((req, res) => {
    res.status(200).json({ status: "OK" });
});

User.self = (async (req, res) => {
    try {
        const data = await user.get(['user_id', (await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id],
            [
                'user_id',
                'user_status',
            ]);

        if (!data || data === 0)
            throw new APIError(500, "invalid user");

        res.status(200).send(data.data.records[0]);

    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

User.online = (async (req, res) => {
    try {
        res.status(200).send({ online: await user.count(['user_status', '1']) });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

User.hasPin = (async (req, res) => {

});

module.exports = User;