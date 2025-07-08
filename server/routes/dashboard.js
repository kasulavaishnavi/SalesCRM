const express = require('express');
const dashboard = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

dashboard.get('/dashboard', getDashboardStats);

module.exports = dashboard;