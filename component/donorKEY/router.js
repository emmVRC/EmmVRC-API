const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .post(controller.add)
    .delete(controller.remove)
    .patch(controller.update);

module.exports = router;