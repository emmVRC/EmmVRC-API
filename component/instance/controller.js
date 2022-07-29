const instance = require('./instance');

const Log = require('../../core/logger/Log');
const APIError = require('../../core/APIError');

const Instance = ((instance) => {
    this.instance = instance.instance;
});

Instance.default = ((req, res) => {
    res.status(200).send();
});

Instance.register = (async (req, res) => {

});

module.exports = Instance;