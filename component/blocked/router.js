const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)
    .post(controller.add)
    .delete(controller.remove);

router.route('/:targetid')
    .post(controller.add)
    .delete(controller.remove);

module.exports = router;