const Profile = require("../models/Profile");

async function getProfile(req, res) {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(200).json({ profile: null });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function saveProfile(req, res) {
  try {
    const {
      fullName,
      phone,
      dateOfBirth,
      bloodGroup,
      gender,
      disease,
      diseaseDetails,
      allergies,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      address,
    } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fullName,
        phone,
        dateOfBirth,
        bloodGroup,
        gender,
        disease,
        diseaseDetails,
        allergies,
        currentMedications,
        emergencyContactName,
        emergencyContactPhone,
        address,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Profile saved", profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { getProfile, saveProfile };
