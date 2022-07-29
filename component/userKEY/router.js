const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .post(controller.get);

router.route('/reset')
    .post(controller.reset);

router.route('/transfer')
    .post(controller.transfer);

router.route('/delete')
    .post(controller.delete);

module.exports = router;
