const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)
    .post(controller.send);

router.route('/:id')
    .get(controller.get)
    .post(controller.send);

module.exports = router;