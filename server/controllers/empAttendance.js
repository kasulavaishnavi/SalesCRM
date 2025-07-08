const EmpAttendance = require("../models/Attendance");
const asyncHandler = require("express-async-handler");

//checkIn Logic
const handleCheckInLogic = asyncHandler(async (empId, user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await EmpAttendance.findOne({ employee: empId, date: today });
  const now = new Date();

  if (!attendance) {
    attendance = await EmpAttendance.create({
      employee: empId,
      date: today,
      checkInOuts: [{ checkedIn: now }],
      status: "Checked In",
    });
    // console.log(` Attendance created for ${user.firstName} at ${now}`);
  } else {
    // Always create a new check-in entry
    attendance.checkInOuts.push({ checkedIn: now });
    attendance.status = "Checked In";
    await attendance.save();
    // console.log(` New check-in recorded for ${user.firstName} at ${now}`);
  }
});


// CheckOut Logic
const handleCheckOutLogic = asyncHandler(async (empId, user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await EmpAttendance.findOne({ employee: empId, date: today });
  const now = new Date();

  if (attendance) {
    const last = attendance.checkInOuts.slice(-1)[0];
    if (last && !last.checkedOut) {
      last.checkedOut = now;
      attendance.status = "Checked Out";
      await attendance.save();
      console.log(`Checked out ${user.firstName} at ${now}`);
    } else {
      console.log(` ${user.firstName} was already checked out.`);
    }
  } else {
    console.log(` No attendance record found for ${user.firstName} to check out.`);
  }
});

//GET todays attendance for loggedIn
const getTodayAttendance = asyncHandler(async (req, res) => {
  const empId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await EmpAttendance.findOne({ employee: empId, date: today });
  if (!attendance) {
    return res.status(404).json({ message: "No attendance for today" });
  }

  res.status(200).json(attendance);
});

// CheckIn API
const checkIn = asyncHandler(async (req, res) => {
  await handleCheckInLogic(req.user._id, req.user);
  res.status(200).json({ message: "Checked in successfully" });
});

//CheckOut API
const checkOut = asyncHandler(async (req, res) => {
  await handleCheckOutLogic(req.user._id, req.user);
  res.status(200).json({ message: "Checked out successfully" });
});

//GET all attendance 
const getAllAttendance = asyncHandler(async (req, res) => {
  const records = await EmpAttendance.find().populate("employee", "firstName lastName email");
  res.status(200).json(records);
});

module.exports = {
  handleCheckInLogic,
  handleCheckOutLogic,
  getTodayAttendance,
  checkIn,
  checkOut,
  getAllAttendance,
};