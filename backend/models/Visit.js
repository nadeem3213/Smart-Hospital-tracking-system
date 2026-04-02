const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Cardiac",
        "Accident",
        "Burns",
        "Orthopedic",
        "Pediatric",
        "Neurology",
        "Respiratory",
        "Trauma",
        "General",
        "Other",
      ],
    },
    hospitalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
