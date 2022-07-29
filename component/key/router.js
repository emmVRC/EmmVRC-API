const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.issue)
    .post(controller.destroy);

// GET
router.get('/request', controller.issue);

// POST
router.post('/destroy', controller.destroy);


router.route('/:key')
    .get(controller.destroy);

module.exports = router;