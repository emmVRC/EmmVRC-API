const Log = require('../../core/logger/Log')
const message = require('./message');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

//TODO: make event based for sockets
const Message = ((message) => {
    this.message = message;
})

Message.get = (async (socket, data) => {
    try {
        const data = await message.get((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.thread_id)
        res.status(200).send(data.data.records[0]);
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});

Message.send = (async (req, res) => {
    try {
        res.status(200).send({
            status: await message.send((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.recipient_id, req.body.subject, req.body.body, (req.body.icon || null))
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Message;