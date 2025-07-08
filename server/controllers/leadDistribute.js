const asyncHandler = require('express-async-handler');
const Lead = require('../models/Leads');
const { uploadCsvLeads } = require('../utils/csvLeads');
const { eligibleEmp, distributeLeads } = require('../utils/distributeLeads');
const { logActivity } = require("../utils/activityLog");

const mongoose = require("mongoose");

const uploadCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded.');
  }

  const csvBuffer = req.file.buffer;
  const { leadsToInsert, validationErrors: csvValidationErrors } = await uploadCsvLeads(csvBuffer);

  //Add name mapping and defaults
  leadsToInsert.forEach(lead => {
    if (!lead.name) {
      const first = lead.firstName || "";
      const last = lead.lastName || "";
      lead.name = `${first} ${last}`.trim();
    }
    lead.status = lead.status || 'Ongoing';
    lead.type = lead.type || 'Warm';
  });

  if (leadsToInsert.length === 0 && csvValidationErrors.length > 0) {
    return res.status(400).json({
      message: 'No valid leads found in CSV. All rows had errors.',
      totalRowsProcessed: csvValidationErrors.length,
      leadsInserted: 0,
      leadsAssigned: 0,
      leadsUnassigned: 0,
      csvValidationErrors,
      databaseDuplicateErrors: [],
      assignmentDetails: [],
    });
  }


  const newLeads = leadsToInsert;
  const databaseDuplicateErrors = [];

  let insertedLeads = [];
  try {
    insertedLeads = await Lead.insertMany(newLeads, { ordered: false });
  } catch (dbError) {
    console.error('InsertMany error:', dbError);
    if (dbError.writeErrors) {
      dbError.writeErrors.forEach(err => {
        databaseDuplicateErrors.push({
          message: err.errmsg || 'Insert error',
          details: err
        });
      });
    }
  }

  if (insertedLeads.length === 0) {
    return res.status(500).json({
      message: 'Leads insertion failed.',
      leadsInserted: 0,
      leadsAssigned: 0,
      leadsUnassigned: 0,
      csvValidationErrors,
      databaseDuplicateErrors,
      assignmentDetails: [],
    });
  }

  //Distributing of  leads
  const eligibleEmployees = await eligibleEmp();
  const { leadsAssigned, leadsUnassigned, assignmentDetails } = await distributeLeads(
    insertedLeads,
    eligibleEmployees
  );

  //Update assignedTo field if assigned
  for (const assigned of leadsAssigned) {
    console.log("Assigning lead:", assigned.leadId, "to employee:", assigned.employeeId);
    const lead = await Lead.findById(assigned.leadId);
    if (lead) {
      lead.assignedTo = assigned.employeeId;
      await lead.save();
    }else {
    console.log("Lead not found:", assigned.leadId);
  }
  }

  // Log activities
  for (const lead of insertedLeads) {
    await logActivity(
     req.session.userId,
      "add_lead",
      `You added a new lead`,
      lead._id
    );
  }

  for (const assignment of leadsAssigned) {
    await logActivity(
           req.session.userId,
      "assign_lead",
      `You assigned lead to ${assignment.employeeName}`,
      assignment.leadId,
      assignment.employeeId
    );
  }

  res.status(200).json({
    message: 'CSV processing complete.',
    totalLeadsInCsv: leadsToInsert.length + csvValidationErrors.length,
    leadsInserted: insertedLeads.length,
    leadsAssigned: leadsAssigned.length,
    leadsUnassigned: leadsUnassigned.length,
    csvValidationErrors,
    databaseDuplicateErrors,
    assignmentDetails,
  });
});

module.exports = {
  uploadCsv,
};