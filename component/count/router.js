const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.online);

module.exports = router;