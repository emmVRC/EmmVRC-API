
const redis = require('redis');
const redisPool = require('redis-connection-pool');
const redisScan = require('node-redis-scan');
const Log = require('../logger/Log');
const mysql = require('./query');
const base64 = require('../util/base64');
//'redis://' + config.host + ":" + config.password + "@" + config.host + ":" + config.port
let client = new redisPool('pool');
/*let client = redis.createClient({
    retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.error && options.error.code === "CONNECTION_BROKEN") {
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    },
});*/

let redisScanner = new redisScan(client);

const start = (() => {
    Log.writeLog("Connected to Redis");
    //client.flushall();
    //fill();
});


const flushall = (() => {
    client.flushall();
});

const find = (async (key) => {
  return new Promise(async(resolve, reject) => {
    let returnedResults = [];

    client.keys(`*${key}*`, (err, result) => {
      if (err)
        reject(err);

      if (result.length === 0)
        resolve(returnedResults);

      if (result.length > 3000)
        Log.writeLog(result.length);

      client.mget(...result, (err, res) => {
        if (err)
          reject(err);

        if (res != undefined)
          [...res].forEach(el => returnedResults.push(el.replace(/"/g, '')));
        resolve(returnedResults);
      });
    });
  });
})


const get = ((key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const sadd = ((set, value) => {
    return new Promise((resolve, reject) => {
        client.sadd(set, value, async (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const srem = ((set, value) => {
    return new Promise((resolve, reject) => {
        client.srem(set, value, async (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const slist = ((set) => {
    return new Promise((resolve, reject) => {
        client.smembers(set, async (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const setWithExpiry = ((key, value, expiryInSeconds) => {
  return new Promise((resolve, reject) => {
    client.set(key, value, async(err, res) => {
      if (err)
        reject(err);
      
      client.expire(key, expiryInSeconds);
      resolve(res);
    });
  });
});

const set = ((key, value, set_name) => {
    value = Buffer.from(JSON.stringify(value));
    return new Promise((resolve, reject) => {
      resolve(null);
      //  client.set(key, value, async (error, result) => {
      //      if (error) reject(error)
      //      resolve(result);
      //  });
    });
});

const del = ((key, set_name) => {
    return new Promise((resolve, reject) => {
        client.del(key, (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const size = ((set_name) => {
    return new Promise((resolve, reject) => {
        client.dbsize((error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const getAll = (() => {
    return new Promise((resolve, reject) => {
        client.keys('*', (error, keys) => {
            if (error) reject(error);
            resolve(keys);
        });
    });
});

const exists = ((key) => {
    return new Promise((resolve, reject) => {
        client.exists(key, (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
});

const fill = (async () => {
//    const avatars = (await mysql.q("SELECT avatar_id , avatar_name , avatar_author_name , avatar_public FROM avatar WHERE avatar_public = 1")).data.records;
     // const avatars = (await mysql.q("SELECT avatar_id , avatar_name , avatar_author_name , avatar_public FROM avatar WHERE avatar_public = 1 AND avatar_author_id NOT IN (SELECT avatar_author_blacklist_author_id FROM avatar_author_blacklist)")).data.records;
    try {
     //   avatars.forEach(async (avatar) => {
     //       set(base64.decode(avatar.avatar_name).toLowerCase() + "_" + base64.decode(avatar.avatar_author_name).toLowerCase() + "_" + avatar.avatar_id.substr(avatar.avatar_id.length - 5), avatar.avatar_id)
     //           .then(() => { /*console.log("OK", avatar.avatar_id);*/ })
     //           .catch(() => { Log.writeError("ERROR", avatar.avatar_id); });
     //   });
    } catch (error) {
        Log.writeError(error);
        throw error;
    }
});

module.exports = { start, get, set, del, find, flushall, size, getAll, exists, sadd, srem, slist, fill, setWithExpiry };
