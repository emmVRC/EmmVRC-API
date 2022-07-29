const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)

router.route('/:targetid')
    .post(controller.add)
    .patch(controller.update)
    .delete(controller.remove);

module.exports = router;