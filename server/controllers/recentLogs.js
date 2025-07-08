const Lead = require("../models/Leads");
const User = require("../models/User");
const mongoose = require("mongoose");

// Admin Recent Acts
const getAdminRecentActivities = async (req, res) => {
  try {
    const [addedLeads, assignedLeads, closedLeads] = await Promise.all([
      Lead.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("assignedTo closedLead"),

      Lead.find({ assignedTo: { $ne: null } })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("assignedTo"),

      Lead.find({ status: "Closed" })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("closedLead assignedTo"),
    ]);

    // Format added leads
    const formattedAdded = addedLeads.map((lead) => ({
      type: "add_lead",
      description: `You added a Lead`,
      leadId: lead._id,
      assignedTo: lead.assignedTo?.firstName || null,
      closedBy: lead.closedLead?.firstName || null,
      date: lead.createdAt,
    }));

    // Format assigned leads
    const formattedAssigned = assignedLeads.map((lead) => ({
      type: "assign_lead",
      description: `You assigned a lead to ${lead.assignedTo?.firstName || "Unassigned"}`,
      leadId: lead._id,
      assignedTo: lead.assignedTo?.firstName || null,
      date: lead.updatedAt,
    }));

    // Format closed leads
    const formattedClosed = closedLeads.map((lead) => {
      const closerName =
        lead.closedLead?.firstName || lead.assignedTo?.firstName || "Unknown";

      return {
        type: "close_lead",
        description: `${closerName} closed a Deal `,
        leadId: lead._id,
        closedBy: closerName,
        date: lead.updatedAt,
      };
    });

    const allActivities = [
      ...formattedAdded,
      ...formattedAssigned,
      ...formattedClosed,
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ activities: allActivities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin recent activities" });
  }
};

//Emp Recent Acts
const getEmployeeRecentActivities = async (req, res) => {
  const empId = req.params.empId;

  const objectIdEmpId = new mongoose.Types.ObjectId(empId);

  const assignedLeads = await Lead.find({
    assignedTo: objectIdEmpId,
    status: { $ne: "Closed" },
  })
    .sort({ updatedAt: -1 })
    .limit(10);

  const closedLeads = await Lead.find({ closedLead: objectIdEmpId })
    .sort({ updatedAt: -1 })
    .limit(10);

  const formattedAssigned = assignedLeads.map((lead) => ({
    empId,
    type: "assign_lead",
    description: `You were assigned lead`,
    leadId: lead._id,
    date: lead.updatedAt,
  }));

  const formattedClosed = closedLeads.map((lead) => ({
    empId,
    type: "close_lead",
    description: `You closed a Deal`,
    leadId: lead._id,
    date: lead.updatedAt,
  }));

  const allActivities = [...formattedAssigned, ...formattedClosed].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  res.json({ activities: allActivities });
};

module.exports = {
  getAdminRecentActivities,
  getEmployeeRecentActivities,
};