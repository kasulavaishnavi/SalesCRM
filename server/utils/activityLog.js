const RecentLog = require("../models/ActivityLog");

const logActivity = async ( userId, activitytype, description, leadId = null, userRelatedId = null) => {
  try {
    await RecentLog.create({
      emp: userId,
      activitytype,
      description,
      leadRelated: leadId,
     userRelated: userRelatedId
    });
  } catch (error) {
    console.error("Activity log failed:", error);
  }
};
  
module.exports = { logActivity };