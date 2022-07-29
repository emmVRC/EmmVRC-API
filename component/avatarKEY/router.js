const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)
    .post(controller.get)
    .patch(controller.update)

router.route('/updated')
    .get(controller.old)

router.route('/blacklist')
    .post(controller.blacklist)

router.route('/reload')
    .post(controller.reload)

module.exports = router;
