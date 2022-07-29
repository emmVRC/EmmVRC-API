const router = require('express').Router();
const protected = require('../component/protected.register');
const keyed = require('../component/keyed.register');
const unprotected = require('../component/unprotected.register');
const Log = require('./logger/Log');
//TODO find a way for keyed endpoints and non keyed or both

router.use('/', unprotected);
router.use("/keyed/:apikey", require('./authentication').key.protect);
router.use('/keyed/:apikey', keyed);
router.use('/', require('./authentication').jsonwebtoken.protect);
router.use('/', protected);

Log.writeLog("Modules Loaded!");

module.exports = router;