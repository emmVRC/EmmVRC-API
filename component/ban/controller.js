const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

const blocked = require('./ban');

//TODO: use and http code and string file for sending errors

const Ban = ((blocked) => {
    this.blocked = blocked;
});

Ban.get = (async (req, res) => {
    try {
        let data = await blocked.get(['blocked_blocker_user_id', (await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id], [
            'blocked_target_user_id',
            'blocked_expire_date',
            'blocked_created_date',
        ]);

        res.status(200).send(data.data.records);
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Ban.add = (async (req, res) => {
    try {
        res.status(200).send({
            status: await blocked.add((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.target_user_id || req.params.targetid, req.body.expire_date || null)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Ban.remove = (async (req, res) => {
    try {
        res.status(200).send({
            status: await blocked.remove((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.target_user_id || req.params.targetid)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Ban.update = ((req, res) => {

});



module.exports = Ban;