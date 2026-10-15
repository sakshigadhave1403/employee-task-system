const router = require('express').Router();
const c = require('../controllers/employee.controller');

router.get('/options', c.options);
router.route('/').get(c.list).post(c.create);
router.route('/:id').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;