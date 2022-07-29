const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');

const user = require('./user');
const mysql = require('../../core/database/query');

const User = ((user) => {
    this.user = user.user;
});

User.get = (async (req, res) => {
    try {
        const data = await user.get(req.body.user_id);

        if (!data || data === 0)
            throw new APIError(500, "invalid user");

        res.status(200).send(data.data.records);

    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

User.reset = (async (req, res) => {
    try {
      let userExists = await mysql.query("SELECT NULL FROM user WHERE user_id = ?", [req.body.user_id]);

      if (userExists.length !== 0) {
        res.status(200).send({
          status:
              await user.changePassword(req.body.user_id, req.body.user_id)
                  .then((result) => { return "OK"; })
                  .catch((error) => { throw error; })
        });
      } else {
        res.status(404).send({ message: "That user does not exist." });
      }
        
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

User.transfer = (async (req, res) => {
    try {
        res.status(200).send({
            status:
                await user.transfer(req.body.old_user_id, req.body.user_id)
                    .then((result) => { return "OK"; })
                    .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

User.delete = (async (req, res) => {
    try {
        res.status(200).send({
            status:
                await user.delete(req.body.user_id)
                    .then((result) => { return "OK"; })
                    .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = User;
