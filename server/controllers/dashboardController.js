

const Lead = require('../models/Leads');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const closedLeads = await Lead.countDocuments({ status: "Closed" });
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });

    const assignedThisWeek = await Lead.countDocuments({
      assignedTo: { $ne: null },
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    });

    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      unassignedLeads,
      assignedThisWeek,
      activeUsers,
      conversionRate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

module.exports = { getDashboardStats };