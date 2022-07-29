const authentication = require('./authentication');
const Log = require('../../core/logger/Log');
const remoteAddress = require('../../core/util/remoteAddress');
const APIError = require('../../core/APIError');
const { none } = require('../../core/logger/logLevel');

const Authentication = ((authentication) => {
    this.authentication = authentication.authentication;
});

Authentication.default = ((req, res) => {
    res.status(200).end();
});

Authentication.signin = (async (req, res) => {
    try {
      let authKeys = await authentication.signin(req.body.username, req.body.name, req.body.password, remoteAddress(req), req.headers['user-agent'], req.body.loginKey || "0", req.body.loginToken)
        .then((result) => { return result; })
        .catch((error) => { throw error; });
        
        let obj
        //YIKES slopy but it works

        if (authKeys[1] != "") {
            obj = {
                token: authKeys[0],
                loginKey: authKeys[1],
                reset: false
            }
        } else {
            obj = {
                token: authKeys[0],
                reset: false
            }
        }
        res.status(200).send(obj);
    } catch (error) {
        error_message = error.message === "object" ? error.obj : { message: error.message };
        let errorJson = JSON.stringify(error);

        if (errorJson.name != undefined && errorJson.name != "APIError")
          console.error(error);
          //Log.writeError("Login Failure - " + error_message.message);
          
        if (error.code)
            res.status(error.code).send(error_message);
        else
            res.status(500).send(error_message);
    }
});

Authentication.signout = (async (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer '))
        try {
            await authentication.signout(bearer.split('Bearer ')[1].trim())
        } catch (error) {
            res.status(200).end();
        }
    res.status(200).end();
});

Authentication.delete = (async (req, res) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith('Bearer '))
      try {
          await authentication.signout(bearer.split('Bearer ')[1].trim())
      } catch (error) {
          res.status(200).end();
      }
  res.status(200).end();
});

Authentication.signup = (async (req, res) => {
    try {
        res.status(200).send({
            status: await authentication.signup(req.body.name, req.body.username, req.body.password, req.body.auto)
                .then((result) => { return result; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError("{0}: {1}", [error.name, error.message]);
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Authentication;
