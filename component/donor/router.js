const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)

module.exports = router;