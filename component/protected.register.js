const router = require('express').Router();
const Log = require('../core/logger/Log');
//const redis = require('../core/database/redis');
const mysql = require('../core/database/query');
const ratelimiterClient = require('redis').createClient();
const { v4: uuid } = require('uuid');

// register endpoints
const component = {
    key: require('./key/router'),
    user: require('./user/router'),
    avatar: require('./avatar/router'),
    blocked: require('./blocked/router'),
    //message: require('./REST_MESSAGE/router'),
};


// ratelimiter
var limiter = require('express-limiter')(router, ratelimiterClient);
limiter({
  path: '/avatar/search',
  method: 'post',
  lookup: ['connection.remoteAddress'],
  total: 32,
  expire: 30000,
  skipHeaders: true,
  ignoreErrors: true,
  lookup: function(req, res, opts, next) {
    opts.lookup = req.headers['x-forwarded-for'] ? 'headers.x-forwarded-for' : 'connection.remoteAddress';
    return next();
  }
});

/*limiter({
  path: '/avatar/info/*',
  method: 'get',
  lookup: ['connection.remoteAddress'],
  total: 500,
  expire: 30000,
  skipHeaders: true,
  ignoreErrors: true,
  lookup: function(req, res, opts, next) {
    opts.lookup = req.headers['x-forwarded-for'] ? 'headers.x-forwarded-for' : 'connection.remoteAddress';
    return next();
  },
  onRateLimited: function (req, res, next) {
      try {
        let avatarInfo = await mysql.q("SELECT avatar.avatar_id,\
        avatar.avatar_name \
        FROM avatar \
        INNER JOIN relation_user_avatar \
        ON relation_user_avatar.relation_user_avatar_avatar_id = avatar.avatar_id\
        WHERE relation_user_avatar.relation_user_avatar_user_id = ? \
        AND avatar.is_deleted = 0 \
        ORDER BY relation_user_avatar.relation_user_avatar_id DESC", [user_id]);

        next({ message: {
          "avatar_id": "avtr_" + uuid(),
          "avatar_name": avatarInfo.avatar_name,
          "avatar_asset_url": "https://api.vrchat.cloud/api/1/file/file_9c8c4f6a-f4c0-49bf-9418-9f617ac3173c/8/file",
          "avatar_thumbnail_image_url": "https://d348imysud55la.cloudfront.net/thumbnails/226497433.thumbnail-500.png",
          "avatar_author_name": "none",
          "avatar_author_id": "usr_7adfdc57-ffe2-40cb-83ff-695454a410f4",
          "avatar_supported_platforms": 1
        }, status: 200 });
    } catch (error) {
        Log.writeError(error);
        next({ message: '', status: 500 });
    }
  }
});*/

// bind the path to the router 
// api/dict_key/endpoint

for (const [route, endpoint] of Object.entries(component)) {
  router.use("/" + route, endpoint);
  Log.writeLog("[ PROTECTED ] Module Loaded: {0}", route);
}

module.exports = router;
