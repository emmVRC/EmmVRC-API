const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');
const jsonwebtoken = require('../../core/authentication').jsonwebtoken;

const avatar = require('./avatar');

const Avatar = ((avatar) => {
    this.avatar = avatar;
});

Avatar.get = (async (req, res) => {
    try {
        const data = await avatar.get((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id);

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

Avatar.add = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.add((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id,
                req.body.avatar_id,
                req.body.avatar_name,
                req.body.avatar_asset_url,
                req.body.avatar_thumbnail_image_url,
                req.body.avatar_author_name,
                req.body.avatar_author_id,
                req.body.avatar_public || null,
                req.body.avatar_supported_platforms,
                req.body.avatar_category)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});
Avatar.put = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.put((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id,
                req.body.avatar_id,
                req.body.avatar_name,
                req.body.avatar_asset_url,
                req.body.avatar_thumbnail_image_url,
                req.body.avatar_author_name,
                req.body.avatar_author_id,
                req.body.avatar_public || null,
                req.body.avatar_supported_platforms,
                req.body.avatar_category)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        //Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Avatar.remove = (async (req, res) => {
    try {
        res.status(200).send({
            status: await avatar.remove((await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id, req.body.avatar_id)
                .then((result) => { return "OK"; })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Avatar.search = (async (req, res) => {
    try {
      const searchData = await avatar.search(req.body.query, req.query.page);
      res.status(200).type('application/json').send(searchData);
      //res.status(200).send(data.data.records);
    } catch (error) {
        Log.writeError(error);
        res.status(error.code).send({ message: error.message });
    }
});

Avatar.lookupAvatarHash = (async (req, res) => {
  try {
    res.status(200).type('application/json').send(await avatar.getAvatarByHashOrId(req.params.avatarIdHash));
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

Avatar.export = (async (req, res) => {
  try {
    let userId = (await jsonwebtoken.payload(jsonwebtoken.get(req.headers))).user_id;
    console.log(userId);
    const exportData = await avatar.getAvatarExportList(userId);

    res.status(200).type('application/json').send(exportData.data.records);
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

module.exports = Avatar;
