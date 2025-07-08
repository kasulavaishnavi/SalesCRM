const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { logActivity } = require('../utils/activityLog');
const { handleCheckInLogic, handleCheckOutLogic } = require('./empAttendance');



//Admin creates emp
const EmpByAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, location, language } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400);
    throw new Error('Please enter firstname, lastname, and email');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Employee with this email already exists');
  }

  // Set initial password as last name
  const password = lastName;

  
  const user = await User.create({
  firstName,
  lastName,
  email,
  password, 
  location,
  language,
});


  if (user) {
    await logActivity(
      user._id,
      'employee_created',
      `Employee ${user.firstName} ${user.lastName} was created by admin`,
      null,
      user._id
    );

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      message: 'Default password is their last name',
      location: user.location,
      language: user.language,
    });
  } else {
    res.status(400);
    throw new Error('Invalid employee data provided');
  }
});


// Employee login with check-in

const empLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    
    req.session.userId = user._id;

    // console.log('Login successful! req.session AFTER setting userId:', req.session);

      user.isActive = true;
    await user.save();
    // Handle attendance check-in logic on login
    await handleCheckInLogic(user._id, user);

    await logActivity(user._id, 'login', `Employee ${user.firstName} ${user.lastName} logged in`);

    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Failed to save session' });
      }
  console.log("Session saved successfully:", req.session);
  
      res.json({
        empId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
        language: user.language,
        assignedLeads: user.assignedLeads
      });
    });

  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});


// Emp logout with checkOut

const empLogout = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  try {
    await handleCheckOutLogic(user._id, user);
    user.isActive = false;
  await user.save();
  } catch (error) {
    console.warn(`Attendance auto check-out failed: ${error.message}`);
  }

  await logActivity(req.user._id, 'logout', `Employee ${req.user.firstName} ${req.user.lastName} logged out.`);

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.status(500).json({ message: 'Failed to logout' });
    }

    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});


// Get current loggedIn profile

const currentProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json({
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    location: req.user.location,
    language: req.user.language,
    assignedLeads: req.user.assignedLeads,
  });
});


// Update employee
const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found');
  }

  user.firstName = updates.firstName || user.firstName;
  user.lastName = updates.lastName || user.lastName;
  user.email = updates.email || user.email;
  user.location = updates.location || user.location;
  user.language = updates.language || user.language;

  await user.save();

  await logActivity(
    req.session.userId,
    'update_employee',
    `Updated employee ${user.firstName} ${user.lastName}`,
    null,
    user._id
  );

  res.status(200).json({ message: 'Employee updated successfully', user });
});

// Delete employee
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found');
  }

  await user.deleteOne();

  await logActivity(
    req.session.userId,
    'delete_employee',
    `Deleted employee ${user.firstName} ${user.lastName}`,
    null,
    user._id
  );

  res.status(200).json({ message: 'Employee deleted successfully' });
});


// Get all employees - Admin usage

const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({}).select('-password');
  res.status(200).json(employees);
});



const updateEmpProfile = asyncHandler(async (req, res) => {
  const updates = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found');
  }

  user.firstName = updates.firstName || user.firstName;
  user.lastName = updates.lastName || user.lastName;
  user.email = updates.email || user.email;
  user.location = updates.location || user.location;
  user.language = updates.language || user.language;

  //Password update 
  if (updates.currentPassword && updates.newPassword) {
    const isMatch = await user.matchPassword(updates.currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
    user.password = updates.newPassword;
  }

  await user.save();

  await logActivity(
    user._id,
    'update_profile',
    `Employee ${user.firstName} ${user.lastName} updated their profile`
  );

  res.status(200).json({ message: 'Profile updated successfully', user });
});

module.exports = {
  EmpByAdmin,
  empLogin,
  empLogout,
  currentProfile,
  getAllEmployees,
   updateEmployee,
  deleteEmployee,
  updateEmpProfile,
};