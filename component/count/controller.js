const Log = require('../../core/logger/Log');

const user = require('../user/user');

//TODO: use and http code and string file for sending errors

const Count = ((count) => {
    this.count = count.count;
});

Count.online = (async (req, res) => {
    try {
        res.status(200).send({ online: await user.count(['user_status', '1']) });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Count;