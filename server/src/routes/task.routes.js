const router = require('express').Router();
const c = require('../controllers/task.controller');

router.get('/export', c.exportCsv);
router.route('/').get(c.list).post(c.create);
router.put('/:id/status', c.updateStatus);
router.route('/:id').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;