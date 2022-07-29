const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authentication = require('../../core/authentication').jsonwebtoken;
const loginKey = require('../../core/authentication/loginKey');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const base64 = require('../../core/util/base64');

const Moderation = require('../../core/moderation');
const Avatar = require('../avatar/avatar');
const User = require('../user/user');
const { jsonwebtoken } = require('../../core/authentication/jsonwebtoken');

const Joi = require('joi');

const signinValidator = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().pattern(/^\d+$/).allow('').disallow(Joi.ref('username')),
  loginToken: Joi.string().allow('')
}).xor('loginToken', 'password');

//TODO when db error return code 500

class Authentication {
    static async signin(username, name, password, address, header, _loginKey, loginToken) {
      let result = signinValidator.validate({
        username: username,
        name: name,
        password: password?.length > 0 ? password: undefined,
        loginToken: loginToken?.length > 0 ? loginToken : undefined
      });

      if (result.error) {
        throw new APIError(401, result.error);
      }

      // ban check
      let banLookup = await Moderation.getBans(null, address);

      if (banLookup == null)
        throw new APIError(authenticationCode.internal, authenticationError.internal);

      if (banLookup.length > 0) {
        Log.writeError("Banned user address to login: " + name + " (" + username + ") Addr: " +  address + " UA: " + header);
        throw new APIError(authenticationCode.unauthorized, "object", {
          banned: true,
          ban_created: banLookup[0].ban_created_date,
          ban_id: banLookup[0].ban_id,
          ban_reason: banLookup[0].ban_message,
          ban_expire: banLookup[0].ban_expire_date
        });
      }
        
      try {
        let loginAttempts = await mysql.q(
          'SELECT NULL FROM login WHERE login_created_date >= NOW() - INTERVAL 5 minute AND login_user_id = ? AND login_success = 0', [username]);
        
          if (loginAttempts.data.count >= 7)
            throw "Too many logins.";

          await mysql.insert('login', {
              user_id: username,
              address: address,
              success: 0,
              agent: header,
          });
      } catch (err) {
        throw new APIError(authenticationCode.forbidden, authenticationError.forbidden);
      }

      // shhhh
      if (username == password) {
        Log.writeError("Attempted use of legacy login: " + name + " (" + username + ") Addr: " +  address + " UA: " + header);
        //let banLookup = await Moderation.getBans(null, address);
        //if (banLookup.length == 0)
        //  await Moderation.createBan(null, address, null, "Modified Client Detected. Please contact emmVRC support.", null);
        
        throw new APIError(401, authenticationError.invalid);
      }

      let emmUser = null;

      try {
        emmUser = await mysql.select(['user_pin', 'user_id'], 'user', ['user_id', '=', username]);
      } catch (err) {
        throw new APIError(authenticationCode.internal, authenticationError.internal);
      }

      if (emmUser == null || emmUser.data.count == 0) {
        // TODO: Remove this auto signup
        try {
          await this.signup(name, username, username, address).then((res) => {}).catch((error) => Log.writeError(error));
          return await this.signin(username, name, username, address, header, _loginKey, loginToken);
        } catch (err) {
          throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
      } else {
        emmUser = emmUser['data']['records'][0];
      }

      let loginValid = false;

      if (emmUser != null) {
        if (password != "") {
          loginValid = await User.verifyPassword(password, emmUser.user_pin);
          const defaultPassword = await User.verifyPassword(username, emmUser.user_pin);
  
          if (defaultPassword && password !== username) {
            await User.changePassword(password, username)
              .then((results) => { return results; })
              .catch((error) => {
                  Log.writeError(error.message);
                  throw new APIError(authenticationCode.unauthorized, authenticationError.invalid);
              });
  
              loginValid = true;
          }
        } else if (loginToken != "") {
          loginValid = await loginKey.verify(loginToken);
        }
      } else {
        try {
          await this.signup(name, username, username, address).then((res) => {}).catch((error) => Log.writeError(error));
          return await this.signin(username, name, username, address, header, _loginKey, loginToken);
        } catch (err) {
          throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
      }

      if (loginValid) {
        try {
          await mysql.q('UPDATE login SET login_success = ? WHERE login_user_id = ? ORDER BY login_created_date desc LIMIT 1', [1, username]);
          // flag user as online (?)
          await mysql.update('user', { status: 1 }, ['user_id', '=', username]);
          // migrate legacy saved avatars
          await Avatar.load(username);
          
          // update known aliases
          let names = (await mysql.select(['user_name', 'user_known_aliases'], 'user', ['user_id', '=', username])).data.records[0];
          if (names.user_name != name) {
            await mysql.update('user', {
              name: base64.encode(name),
              known_aliases: 
                ((names.user_known_aliases.split(",")).includes(base64.encode(name)) ? names.user_known_aliases 
                  : names.user_known_aliases + base64.encode(name) + ",")
            }, ['user_id', '=', username]);
          }
        } catch (err) {
          throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
        
        // ban check (user)
        let banLookup = await Moderation.getBans(username, null);

        if (banLookup == null)
          throw new APIError(authenticationCode.internal, authenticationError.internal);

        if (banLookup.length > 0) {
          Log.writeError("Banned user attempted to login: " + name + " (" + username + ") Addr: " +  address + " UA: " + header);
          throw new APIError(authenticationCode.unauthorized, "object", {
            banned: true,
            ban_created: banLookup[0].ban_created_date,
            ban_id: banLookup[0].ban_id,
            ban_reason: banLookup[0].ban_message,
            ban_expire: banLookup[0].ban_expire_date
          });
        }

        let jwtToken = await authentication.issue(emmUser.user_id)
        .catch((error) => {
            Log.writeError(error.message);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        });
        let rememberMeKey = _loginKey === "1" ? await loginKey.issue(username) : '';

        return [jwtToken, rememberMeKey];
      } else {
        throw new APIError(authenticationCode.unauthorized, authenticationError.invalid); 
      }
    }

    static async signup(name, username, password, remoteAddress = null) {
        if (typeof username !== "string" || typeof password !== "string" || !username || !password)
            throw new APIError(authenticationCode.badRequest, authenticationError.missing);

        try {
            return User.register(name, username, password, remoteAddress)
                .then((result) => { return "Ok"; })
                .catch((error) => { throw new APIError(authenticationCode.badRequest, authenticationError.exists); });
        } catch (error) {
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async signout(token) {
        try {
            await mysql.update('user', { status: 0 }, ['user_id', '=', (await authentication.payload(token)).user_id]);
            await authentication.destroy(token);
        } catch (error) {
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = Authentication;
