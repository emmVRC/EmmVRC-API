const uuid = require('uuid');
const Log = require('../../core/logger/Log')
const message = require('./message');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

//TODO: make event based for sockets
const Message = ((message) => {
    this.message = message;
})

Message.get = (async (req, res) => {
    try {
        res.status(200).send(
            await message.get((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.params.channel == "global" ? req.params.channel : null, req.params.senderid || null)
                .then((result) => { return result; })//return result.data.records;
                .catch((error) => { throw error; })
        );
    } catch (error) {
        Log.writeError(error)
        res.status(error.code || 500).send({ message: error.message });
    }
});

Message.send = (async (req, res) => {
    try {
        res.status(200).send({
            status: await message.send((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.recipient, req.body.body, (req.body.icon || null))
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});


Message.read = (async (req, res) => {
    try {
        res.status(200).send({
            status: await message.read((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.params.messageid || req.body.message_id)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Message;