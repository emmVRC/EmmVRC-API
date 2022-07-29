const router = require('express').Router();
const controller = require('./controller');

// GET
router.get('/', controller.default);
router.get('/logout', controller.signout);

// POST
router.post('/login', controller.signin);
router.post('/register', controller.signup);

// smart way of doing this
router.post('/', controller.signin);
router.post('/refresh', controller.default);

router.delete('/', controller.signout);


module.exports = router;