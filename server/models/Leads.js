const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      match: [/.+@.+\..+/, "Please fill a vaild email address"],
    },
    receivedDate: {
      type: Date,
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true],
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Closed"],
      default: "Ongoing",
    },
    type: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "Warm",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    scheduledCalls: {
      type: Date,
      required: false,
    },
    closedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    this.invalidate(
      "email",
      "either email or phone number must be provided",
      "required"
    );
    this.invalidate(
      "phone",
      "either email or phone number must be provided",
      "required"
    );
  }
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;