const merge = require('lodash').merge;

const config = {
    dev: 'development',
    test: 'testing',
    prod: 'production',
    port: 3000,
    secrets: {
        jwt: process.env.JWT_SECRET || 'secret',
        jwtExp: '72h'
    },
    socket: {
        port: 3030
    }
}

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

let envConfig;
try {
    envConfig = require('./' + config.env);
    envConfig = envConfig || {};
} catch (e) {
    envConfig = {};
}

module.exports = merge(config, envConfig);
