const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLeadType,
  updateLeadSchedule,
  updateLeadStatus
} = require('../controllers/leadsController');
const { uploadCsv } = require("../controllers/leadDistribute");
const upload = require('../middleware/uploadMiddleware');

// Upload CSV route 
router.post('/upload-csv', upload.single('file'), (req, res, next) => {
  console.log("upload-csv route HIT");
  next();
}, uploadCsv);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById);

router.patch('/:id/type', updateLeadType);
router.patch('/:id/schedule', updateLeadSchedule);
router.patch('/:id/status', updateLeadStatus);

module.exports = router;