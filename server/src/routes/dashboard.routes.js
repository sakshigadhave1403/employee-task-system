const router = require('express').Router();
const c = require('../controllers/dashboard.controller');

router.get('/', c.get);

module.exports = router;