const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

const avatar = require('./avatar');

const Avatar = ((avatar) => {
    this.avatar = avatar;
});

Avatar.get = (async (req, res) => {
    try {
        let where = req.body.where
        if (typeof where != 'object')
            where = [1, 1]

        const data = await avatar.get(where);

        if (!data)
            throw new APIError(500, "no data");

        res.status(200).send(data.data.records);

    } catch (error) {
        Log.writeError(error);
        if (error.code)
            res.status(error.code).send({ message: error.message });
        else
            res.status(500).end();
    }
});


Avatar.old = (async (req, res) => {
    try {
        const data = await avatar.old();
        res.status(200).send(data.data.records);
    } catch (error) {
        Log.writeError(error);
        if (error.code)
            res.status(error.code).send({ message: error.message });
        else
            res.status(500).end();
    }
});

Avatar.update = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.update(req.body.values, req.body.avatar_id)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(500).end();
        // res.status(error.code).send({ message: error.message });
    }
});

Avatar.blacklist = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.blacklist(req.body.author_id)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(500).end();
    }
});

Avatar.reload = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.reload()
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(500).end();
    }
});

module.exports = Avatar;
