const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLeadType,
  updateLeadSchedule,
  updateLeadStatus,
  empLeads,
} = require('../controllers/leadsController');
const { uploadCsv } = require("../controllers/leadDistribute");
const upload = require('../middleware/uploadMiddleware');
  const { isAuthenticated, } = require('../middleware/empMiddleware');


// Upload CSV route 
router.post('/upload-csv', upload.single('file'), (req, res, next) => {
  console.log("upload-csv route HIT");
  next();
}, uploadCsv);

router.get("/empleads",isAuthenticated, empLeads);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById);

router.patch('/:id/type',isAuthenticated, updateLeadType);
router.patch('/:id/schedule',isAuthenticated, updateLeadSchedule);
router.patch('/:id/status',isAuthenticated, updateLeadStatus);
module.exports = router;