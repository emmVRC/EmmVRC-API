const router = require('express').Router();
const controller = require('./controller');

router.route('/')
    .get(controller.get)
    .post(controller.add)
    .put(controller.put)
    .delete(controller.remove);

router.route('/export')
  .get(controller.export);

router.route('/search')
    .post(controller.search);

router.route('/info/:avatarIdHash')
  .get(controller.lookupAvatarHash);

module.exports = router;
