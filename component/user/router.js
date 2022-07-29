const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.self);

router.route('/count')
    .get(controller.online);

module.exports = router;