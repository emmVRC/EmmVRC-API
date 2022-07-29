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
        password: process.env.DBPASS,
        schema: '',
        timeout: 10000,
        limit: 100,
        debug: false,
        multipleStatements: true,
        maxAttempts: 5,
        retryTimer: 10000,
    }
};
