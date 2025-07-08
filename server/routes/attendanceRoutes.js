const express = require("express");
const router = express.Router();
const {
  getTodayAttendance,
  checkIn,
  checkOut,
  getAllAttendance,
} = require("../controllers/empAttendance");
const { isAuthenticated } = require("../middleware/empMiddleware");

router.get("/today", isAuthenticated, getTodayAttendance);
router.post("/checkin", isAuthenticated, checkIn);
router.post("/checkout", isAuthenticated, checkOut);
router.get("/all", isAuthenticated, getAllAttendance);

module.exports = router;