const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, default: null },
});

const checkInOutSchema = new mongoose.Schema({
  checkedIn: { type: Date, required: true },
  checkedOut: { type: Date, default: null },
});

const EmpAttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    checkInOuts: { type: [checkInOutSchema], default: [] },
    breaks: { type: [breakSchema], default: [] },
    breakduration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Checked In", "Checked Out"],
      default: "Checked In",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmpAttendance", EmpAttendanceSchema);