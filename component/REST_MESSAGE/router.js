const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)
    .post(controller.send)
    .patch(controller.read);

router.route('/:channel')
    .get(controller.get);

router.route('/:channel/:senderid')
    .get(controller.get);

router.route('/:messageid')
    .patch(controller.read);

module.exports = router;