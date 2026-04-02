const Visit = require("../models/Visit");

async function getNextCaseId() {
  const lastVisit = await Visit.findOne().sort({ createdAt: -1 }).select("caseId");
  if (!lastVisit || !lastVisit.caseId) return "EMG109";
  const num = parseInt(lastVisit.caseId.replace("EMG", ""), 10);
  return `EMG${num + 1}`;
}

async function createVisit(req, res) {
  try {
    const { type, hospitalName, status } = req.body;

    if (!type || !hospitalName) {
      return res.status(400).json({ message: "Type and hospital are required" });
    }

    const caseId = await getNextCaseId();

    const visit = await Visit.create({
      caseId,
      userId: req.user.id,
      type,
      hospitalName,
      status: status || "Pending",
    });

    return res.status(201).json({ message: "Case recorded", visit });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getVisits(req, res) {
  try {
    const visits = await Visit.find().sort({ createdAt: -1 }).limit(50);

    const cases = visits.map((v) => ({
      caseId: v.caseId,
      type: v.type,
      hospital: v.hospitalName,
      time: new Date(v.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: v.status,
    }));

    return res.status(200).json({ cases });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getUserVisits(req, res) {
  try {
    const visits = await Visit.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const cases = visits.map((v) => ({
      caseId: v.caseId,
      type: v.type,
      hospital: v.hospitalName,
      time: new Date(v.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: v.status,
    }));

    return res.status(200).json({ cases });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { createVisit, getVisits, getUserVisits };
