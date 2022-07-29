const APIError = require('../../core/APIError');
const mysql = require('../../core/database/query');
const Log = require('../../core/logger/Log');
const fs = require('fs');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const base64 = require('../../core/util/base64');
const zlib = require('zlib');
const redis = require('../../core/database/redis');

const {influx, Point} = require('../../core/database/influx');
const httpRequest = require('../../core/httpRequest');
const crypto = require('crypto');


const Joi = require('joi');

const avatarValidator = Joi.object({
  user_id: Joi.string().required(),
  avatar_id: Joi.string().required(),
  avatar_asset_url: Joi.string().pattern(/^(https?:\/\/)(api\.vrchat\.cloud|dbinj8iahsbec\.cloudfront\.net)\/(api\/1\/file|avatars)?\/(((file_)([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/\d\/file)?(.+?\.vrca)?)/).required(),
  avatar_thumbnail_image_url: Joi.string().required(),
  avatar_author_id: Joi.string().required(),
  avatar_supported_platforms: Joi.number().integer().min(0).max(255),
  avatar_name: Joi.string()
});

class Avatar {
    constructor() { }

    static async load(user_id) {
        let file = `Avatars/${user_id}.emm`;
        if (!fs.existsSync(file)) return;

        fs.readFile(file, (async (error, data) => {
            if (error) return;
            let jsondata = JSON.parse(data);
            for (const element of jsondata) {
                await Avatar.add(user_id, element.id, base64.decode(element.name), element.assetUrl, element.thumbnailImageUrl, "none", element.authorId, element.supportedPlatforms || 1, null)
                    .catch((error) => { return; }).then(() => { });
            };
        }));
        await fs.unlink(file, ((error) => { return; }));
    }

    static async getAvatarExportList(user_id) {
        try {
            return mysql.q("SELECT avatar.avatar_id,\
            avatar.avatar_name \
            FROM avatar \
            INNER JOIN relation_user_avatar \
            ON relation_user_avatar.relation_user_avatar_avatar_id = avatar.avatar_id\
            WHERE relation_user_avatar.relation_user_avatar_user_id = ? \
            AND avatar.is_deleted = 0 \
            ORDER BY relation_user_avatar.relation_user_avatar_id DESC", [user_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async get(user_id) {
      try {
        return mysql.q("SELECT avatar.avatar_id,\
        avatar.avatar_name, \
        avatar.avatar_asset_url, \
        avatar.avatar_thumbnail_image_url, \
        avatar.avatar_author_name, \
        avatar.avatar_author_id, \
        IFNULL(avatar.avatar_public, 1) AS avatar_public,    \
        avatar.avatar_supported_platforms, \
        relation_user_avatar.relation_user_avatar_avatar_category AS avatar_category,\
        relation_user_avatar.relation_user_avatar_id \
        FROM avatar \
        INNER JOIN relation_user_avatar \
        ON relation_user_avatar.relation_user_avatar_avatar_id = avatar.avatar_id\
        WHERE relation_user_avatar.relation_user_avatar_user_id = ? \
        AND avatar.is_deleted = 0 \
        ORDER BY relation_user_avatar.relation_user_avatar_id DESC", [user_id]);
      } catch (error) {
          Log.writeError(error);
          throw new APIError(authenticationCode.internal, authenticationError.internal);
      }
  }

    static async add(user_id, avatar_id, avatar_name, avatar_asset_url, avatar_thumbnail_image_url,
      avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms, avatar_category) {
        let result = avatarValidator.validate({
          user_id: user_id,
          avatar_id: avatar_id,
          avatar_asset_url: avatar_asset_url,
          avatar_thumbnail_image_url: avatar_thumbnail_image_url,
          avatar_author_id: avatar_author_id,
          avatar_supported_platforms: avatar_supported_platforms,
          avatar_name: avatar_name
        });
  
        if (result.error) {
          Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
          throw new APIError(400, result.error);
        }

        //avatar_public = (avatar_public === undefined) ? null : avatar_public;

        try {
          const returnedRows = await mysql.q('SELECT NULL FROM avatar WHERE avatar_id = ?', [avatar_id]);
  
          if (returnedRows.data.count != 0) {
            return await mysql.replace("relation_user_avatar", {
              user_id: user_id,
              avatar_id: avatar_id,
              avatar_category: avatar_category || null
            });
          }
        } catch (err) {
          throw APIError(500, "Internal error during avatar lookup");
        }


	      try {
          let avatarIdHash = crypto.createHash('sha256').update(avatar_id).digest('hex');
          avatarIdHash = avatarIdHash + "+" + crypto.createHash('sha256').update(avatar_author_id).digest('hex');
          await mysql.q('INSERT INTO avatar (avatar_id, avatar_id_sha256, avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE avatar_id = avatar_id',
          [
            avatar_id,
            avatarIdHash,
            avatar_name,
            avatar_asset_url,
            avatar_thumbnail_image_url,
            avatar_author_name,
            avatar_author_id,
            avatar_public,
            avatar_supported_platforms
          ]);

          return await mysql.replace("relation_user_avatar", {
              user_id: user_id,
              avatar_id: avatar_id,
              avatar_category: avatar_category || null
          });
            // let url = base.split(/\/(.+)/);
            /*return httpRequest(avatar_asset_url)
                .then(async (data) => {

                    if (data.error && data.error.status_code){
                        Log.writeError(data.error);
                        Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
                        throw new APIError(authenticationCode.badRequest, authenticationCode.badRequest);
                    }

                    try {
                        if ((await mysql.q("SELECT NULL FROM `relation_user_avatar` \
                        WHERE `relation_user_avatar_user_id` = ? \
                        AND `relation_user_avatar_avatar_id` = ?",
                            [user_id, avatar_id])).length > 0)
                            throw new APIError(200, authenticationError.exists);
                    } catch (error) {
                        throw new APIError(200, authenticationError.exists);
                    }

                    try {
                        let avatarIdHash = crypto.createHash('sha256').update(avatar_id).digest('hex');
                        avatarIdHash = avatarIdHash + "+" + crypto.createHash('sha256').update(avatar_author_id).digest('hex');
                        await mysql.q('INSERT INTO avatar (avatar_id, avatar_id_sha256, avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE avatar_id = avatar_id',
                        [
                          avatar_id,
                          avatarIdHash,
                          avatar_name,
                          avatar_asset_url,
                          avatar_thumbnail_image_url,
                          avatar_author_name,
                          avatar_author_id,
                          avatar_public,
                          avatar_supported_platforms
                        ]);

                        return await mysql.replace("relation_user_avatar", {
                            user_id: user_id,
                            avatar_id: avatar_id,
                            avatar_category: avatar_category || null
                        });

                    } catch (error) {
                        Log.writeError(error);
                        Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
                        throw new APIError(authenticationCode.internal, authenticationError.internal);
                    }
                })
                .catch((error) => { Log.writeError(error); Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url); throw new APIError(authenticationCode.badRequest, authenticationError.badRequest); });*/
        } catch (error) {
            Log.writeError(error);
            Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
            throw new APIError(authenticationCode.badRequest, authenticationError.badRequest);
        }
    }

    static async put(user_id, avatar_id, avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms, avatar_category) {
      let result = avatarValidator.validate({
        user_id: user_id,
        avatar_id: avatar_id,
        avatar_asset_url: avatar_asset_url,
        avatar_thumbnail_image_url: avatar_thumbnail_image_url,
        avatar_author_id: avatar_author_id,
        avatar_supported_platforms: avatar_supported_platforms,
        avatar_name: avatar_name
      });

      if (result.error) {
        Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
        throw new APIError(400, result.error);
      }

        //avatar_public = (avatar_public === undefined) ? null : avatar_public;

      try {
        const returnedRows = await mysql.q('SELECT NULL FROM avatar WHERE avatar_id = ?', [avatar_id]);

        if (returnedRows.data.count != 0)
          return;
      } catch (err) {
        // oops lets continue
      }


	    try {
            // let url = base.split(/\/(.+)/);
            try {
              let avatarIdHash = crypto.createHash('sha256').update(avatar_id).digest('hex');
              avatarIdHash = avatarIdHash + "+" + crypto.createHash('sha256').update(avatar_author_id).digest('hex');
              await mysql.q('INSERT INTO avatar (avatar_id, avatar_id_sha256, avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE avatar_id = avatar_id',
              [
                avatar_id,
                avatarIdHash,
                avatar_name,
                avatar_asset_url,
                avatar_thumbnail_image_url,
                avatar_author_name,
                avatar_author_id,
                avatar_public,
                avatar_supported_platforms
              ]);

              return {};
          } catch (error) {
              Log.writeError(error);
              Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
              throw new APIError(authenticationCode.internal, authenticationError.internal);
          }
            /*return httpRequest(avatar_asset_url)
                .then(async (data) => {

                    if (data.error && data.error.status_code){
                        Log.writeError(data.error);
                        Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
                        throw new APIError(authenticationCode.badRequest, authenticationCode.badRequest);
                    }

                    try {
                        let avatarIdHash = crypto.createHash('sha256').update(avatar_id).digest('hex');
                        avatarIdHash = avatarIdHash + "+" + crypto.createHash('sha256').update(avatar_author_id).digest('hex');
                        await mysql.q('INSERT INTO avatar (avatar_id, avatar_id_sha256, avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_public, avatar_supported_platforms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE avatar_id = avatar_id',
                        [
                          avatar_id,
                          avatarIdHash,
                          avatar_name,
                          avatar_asset_url,
                          avatar_thumbnail_image_url,
                          avatar_author_name,
                          avatar_author_id,
                          avatar_public,
                          avatar_supported_platforms
                        ]);
                    } catch (error) {
                        Log.writeError(error);
                        Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
                        throw new APIError(authenticationCode.internal, authenticationError.internal);
                    }
                })
                .catch((error) => { Log.writeError(error); Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url); throw new APIError(authenticationCode.badRequest, authenticationError.badRequest); });*/
        } catch (error) {
            Log.writeError(error);
            Log.writeLog("Bad Avatar: ID = "+avatar_id+", Name = "+avatar_name+", Asset URL = "+avatar_asset_url+", Thumbnail URL = "+avatar_thumbnail_image_url);
            throw new APIError(authenticationCode.badRequest, authenticationError.badRequest);
        }
    }

    static async remove(user_id, avatar_id) {
        if (!avatar_id)
            throw new APIError(authenticationCode.badRequest, authenticationCode.missing);

        try {
            return await mysql.q("DELETE FROM relation_user_avatar WHERE relation_user_avatar_user_id = ? AND relation_user_avatar_avatar_id = ?", [user_id, avatar_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async getAvatarByHashOrId(avatarIdOrHash) {
      if (avatarIdOrHash == undefined || avatarIdOrHash == "")
        throw new APIError(404, "Avatar not found.");

      try {
        let avatarInfo = await mysql.q("SELECT avatar_id,	avatar_name, avatar_asset_url, avatar_thumbnail_image_url, avatar_author_name, avatar_author_id, avatar_supported_platforms FROM avatar WHERE (avatar_id = ? OR avatar_id_sha256 = ?) AND avatar_public = 1 AND is_deleted = 0 AND avatar_author_id NOT IN (SELECT avatar_author_blacklist_author_id FROM avatar_author_blacklist)", [avatarIdOrHash, avatarIdOrHash]);

        if (avatarInfo.data.count != 1)
          throw new APIError(404, "Avatar not found.");
  
        return avatarInfo.data.records[0];
      } catch (error) {
        throw error;
      }
    }

    static async search(query, page) {
        influx.writePoint(new Point('searches')
          .tag('query', query.toLowerCase())
          .intField('value', 1)
          .timestamp(new Date()));

        let unfilteredQuery = query;
        query = (((query.replace(/\*/g, ""))).replace(/0/g, "")).toLowerCase();
        query = query.replace("crash", "");
        query = query.replace("hitler", "");
        query = query.replace(/\/(.*?)\^/, "");
        query = query.replace("%", "\\%");
        query = query.replace(/_/g, "\\_");

        // old code
        if (!query || query.length < 3) {
          Log.writeError("Query: " + unfilteredQuery);
          throw new APIError(400, "Invalid search term");
        }
          
        try {
          let cacheLookup = await redis.get("search_cache_" + query).then(results => results).catch((err) => null);
        
          if (cacheLookup)
            return zlib.gunzipSync(Buffer.from(JSON.parse(cacheLookup).data));

          let databaseQuery = "%" + query + "%";
          let databaseLookup = await mysql.q("SELECT avatar_id_sha256 AS avatar_id,	avatar_name, avatar_thumbnail_image_url, avatar_author_id, avatar_supported_platforms FROM avatar WHERE (avatar_name LIKE ? OR avatar_author_name LIKE ?) AND avatar_public = 1 AND is_deleted = 0 AND avatar_author_id NOT IN (SELECT avatar_author_blacklist_author_id FROM avatar_author_blacklist)", [databaseQuery, databaseQuery]);
          let jsonData = JSON.stringify(databaseLookup.data.records);
          let compressedData = zlib.gzipSync(Buffer.from(jsonData));
          let compressedObject = JSON.stringify({ data: compressedData });
          redis.setWithExpiry("search_cache_" + query, compressedObject, 1800).catch(err => console.log(err));

          return jsonData;
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = Avatar;
