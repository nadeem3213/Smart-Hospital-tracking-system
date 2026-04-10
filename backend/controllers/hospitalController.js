const Hospital = require("../models/Hospital");

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({});
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error fetching hospitals" });
  }
};

// @desc    Create a hospital
// @route   POST /api/hospitals
// @access  Public (Can secure later)
const createHospital = async (req, res) => {
  try {
    const {
      name,
      type,
      distance,
      eta,
      icuBeds,
      generalBeds,
      doctors,
      specialization,
      status,
      lat,
      lng,
      description,
      phone,
      email,
      established,
      specialties,
    } = req.body;

    const hospitalExists = await Hospital.findOne({ name });
    if (hospitalExists) {
      return res.status(400).json({ message: "Hospital with this name already exists" });
    }

    const hospital = await Hospital.create({
      name,
      type,
      distance,
      eta,
      icuBeds,
      generalBeds,
      doctors,
      specialization,
      status,
      lat,
      lng,
      description,
      phone,
      email,
      established,
      specialties,
    });

    if (hospital) {
      const io = req.app.get("io");
      if (io) io.emit("HOSPITAL_ADDED", hospital);
      res.status(201).json(hospital);
    } else {
      res.status(400).json({ message: "Invalid hospital data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error creating hospital" });
  }
};

// @desc    Get aggregated stats
// @route   GET /api/hospitals/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const hospitals = await Hospital.find({});
    const totalICU = hospitals.reduce((s, h) => s + (h.icuBeds || 0), 0);
    const totalGeneral = hospitals.reduce((s, h) => s + (h.generalBeds || 0), 0);
    const totalDoctors = hospitals.reduce((s, h) => s + (h.doctors || 0), 0);
    const totalHospitals = hospitals.length;
    res.json({ totalICU, totalGeneral, totalDoctors, totalHospitals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error fetching stats" });
  }
};

// @desc    Update a hospital
// @route   PUT /api/hospitals/:id
// @access  Admin
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const allowedFields = [
      "name", "type", "icuBeds", "generalBeds", "doctors",
      "specialization", "status", "description",
      "phone", "email", "established", "specialties",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        hospital[field] = req.body[field];
      }
    }

    const updated = await hospital.save();
    const io = req.app.get("io");
    if (io) io.emit("HOSPITAL_UPDATED", updated);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error updating hospital" });
  }
};

module.exports = {
  getHospitals,
  createHospital,
  getStats,
  updateHospital,
};
