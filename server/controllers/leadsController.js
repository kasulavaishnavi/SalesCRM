const Lead = require("../models/Leads");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { eligibleEmp, distributeLeads } = require("../utils/distributeLeads");
const User = require("../models/User");

const startOfDay = (inpDate) => {
  const date = new Date(inpDate);
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };
  const format = new Intl.DateTimeFormat("en-US", options);
  const parts = format.formatToParts(date);
  let year, month, day;
  for (const part of parts) {
    if (part.type == "year") year = parseInt(part.value);
    if (part.type == "month") month = parseInt(part.value) - 1;
    if (part.type == "day") day = parseInt(part.value);
  }
  return new Date(year, month, day, 0, 0, 0, 0);
};

//Get all leads
const getLeads = asyncHandler(async (req, res) => {
  let filter = {};
  const { status, type, assignedTo, search, scheduledCalls } = req.query;

  if (scheduledCalls === "true") {
    filter.scheduledCalls = { $exists: true, $ne: null };
  }

  if (assignedTo === "me" && req.user && req.user._id) {
    filter.assignedTo = req.user._id;
  } else if (assignedTo && assignedTo !== "me") {
    if (mongoose.Types.ObjectId.isValid(assignedTo)) {
      filter.assignedTo = assignedTo;
    } else if (assignedTo === "unassigned") {
      filter.assignedTo = null;
    } else {
      res.status(400);
      throw new Error("Invalid 'assignedTo' parameter.");
    }
  }

  if (status) filter.status = status;
  if (type) filter.type = type;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const leads = await Lead.find(filter)
    .populate("assignedTo", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.status(200).json(leads);
});

//Get single lead by Id

const getLeadById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ message: 'Invalid Lead ID' });
}
  const lead = await Lead.findById(req.params._id).populate(
    "assignedTo",
    "firstName lastName email"
  );

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  res.status(200).json(lead);
});

//Create a new lead

const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, status, type, source, language, location, receivedDate } = req.body;

  if (!name || (!email && !phone)) {
    res.status(400);
    throw new Error("Please include a name and at least an email or phone number.");
  }

  const existingLead = await Lead.findOne({
    $or: [
      { email: email ? email.toLowerCase() : null },
      { phone: phone ? String(phone).trim() : null }
    ].filter(Boolean)
  });

  if (existingLead) {
    res.status(400);
    throw new Error("A lead with this email or phone already exists.");
  }

  //Validate dateReceived
let parsedDateReceived = undefined;
if (receivedDate) {
  const [day, month, year] = receivedDate.split('-').map(Number);
  if (!day || !month || !year) {
    res.status(400);
    throw new Error("Invalid date format for 'receivedDate'. Use DD-MM-YYYY.");
  }
  parsedDateReceived = new Date(year, month - 1, day);
  if (isNaN(parsedDateReceived)) {
    res.status(400);
    throw new Error("Invalid date format for 'receivedDate'. Use DD-MM-YYYY.");
  }
}


  const leadData = {
    name,
    email: email ? email.toLowerCase() : undefined,
    phone: phone ? String(phone).trim() : undefined,
    status: status || "Ongoing",
    type: type || "Warm",
    source: source || "Direct Entry",
    language: language || "English",
    location: location || "Unknown",
    receivedDate: parsedDateReceived
  };

  let newLead = await Lead.create(leadData);

  if (!newLead) {
    res.status(400);
    throw new Error("Invalid lead data provided.");
  }

  // console.log(`Attempting to assign new lead: ${newLead.name}`);

  const eligibleEmployees = await eligibleEmp();
  const leadsToDistribute = [newLead];
  const { leadsAssigned, leadsUnassigned, assignmentDetails } = await distributeLeads(
    leadsToDistribute,
    eligibleEmployees
  );

  if (leadsAssigned.length > 0) {
    await newLead.save();
    // console.log(`Lead "${newLead.name}" assigned and saved.`);
  } else {
    console.log(`Lead "${newLead.name}" created but not assigned.`);
  }

  const finalLeadState = leadsAssigned[0] || leadsUnassigned[0];

  if (!finalLeadState) {
    // console.error("Lead not found in assigned or unassigned lists after distribution.");
    res.status(500);
    throw new Error("Lead creation successful, but error during assignment process.");
  }

  res.status(201).json({
    message: "Lead created and assignment attempted.",
    lead: finalLeadState,
    assignmentDetails: assignmentDetails.length > 0 ? assignmentDetails[0] : null
  });
});

// PATCH update lead type
const updateLeadType = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  lead.type = type;
  await lead.save();
  res.status(200).json(lead);
});

// PATCH update scheduled date & time
const updateLeadSchedule = asyncHandler(async (req, res) => {
  const { date, time } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const scheduleDate = new Date(`${date}T${time}`);
  lead.scheduledCalls = scheduleDate;

  await lead.save();

  res.status(200).json({ message: "Schedule updated", lead });
});

// PATCH update lead status
const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
 if (status === "Closed") {

    lead.closedLead = req.user._id; 
  }

  lead.status = status;
  await lead.save();

  res.status(200).json({ message: "Lead status updated successfully", lead });
});


// Get leads assigned to the current logged-in employee
const empLeads = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized. Please login again.");
  }

  const leads = await Lead.find({ assignedTo: req.user._id });
  res.status(200).json(leads);
});


module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLeadType,
  updateLeadSchedule,
  updateLeadStatus,
  empLeads
};