const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.self);

router.route('/:id')
    .get(controller.id);

module.exports = router;