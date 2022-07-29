module.exports = {
    hash: {
        saltRounds: 12,
        keySalt: 8
    },
    key: {
        salt: '',
        salt2: ''
    },
    database: {
        url: '',
        user: '',
        password: process.env.DBPASS,//TODO: change around
        schema: '',
        timeout: 10000,
        limit: 600,
        debug: false,
        multipleStatements: true,
        maxAttempts: 5,
        retryTimer: 10000,
    },
    influx: {
      url: '',
      org: '',
      bucket: '',
      token: '' // todo
    }
};
