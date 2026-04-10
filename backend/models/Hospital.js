const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["government", "private"],
      required: true,
    },
    distance: {
      type: String,
      default: "0 km",
    },
    eta: {
      type: String,
      default: "0 min",
    },
    icuBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    generalBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    doctors: {
      type: Number,
      required: true,
      default: 0,
    },
    specialization: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "busy", "critical"],
      default: "available",
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    established: {
      type: String,
    },
    specialties: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
