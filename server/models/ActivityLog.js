const mongoose = require("mongoose");

const recentLogSchema = new mongoose.Schema({
  emp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activitytype: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  leadRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    default: null
  },
  userRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  timeStamp: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model("RecentLog", recentLogSchema);