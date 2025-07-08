
const express = require('express');
const router = express.Router();

const {
  getAdminRecentActivities,
  getEmployeeRecentActivities
} = require('../controllers/recentLogs');


const { isAuthenticated } = require('../middleware/empMiddleware');

// Admin recent activities
router.get('/admin', getAdminRecentActivities);

// Emp recent activities 
router.get('/employee/:empId', isAuthenticated, getEmployeeRecentActivities);

module.exports = router;
