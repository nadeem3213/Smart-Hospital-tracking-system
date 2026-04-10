const mongoose = require("mongoose");
const Hospital = require("./models/Hospital");
const { MONGODB_URI } = require("./config");

const hospitalData = [
  {
    name: "City General Hospital",
    type: "government",
    distance: "2.3 km",
    eta: "4 min",
    icuBeds: 8,
    generalBeds: 24,
    doctors: 12,
    specialization: "Trauma & Emergency Care",
    status: "available",
    lat: 18.5308,
    lng: 73.8474,
    description: "A leading government trauma center equipped with state-of-the-art emergency facilities, providing 24/7 critical care and accident response services to the city.",
    phone: "+91-20-2612-3456",
    email: "info@citygeneralhospital.gov.in",
    established: "1987",
    specialties: ["Trauma Surgery", "Emergency Medicine", "Critical Care", "General Surgery", "Anesthesiology", "Radiology"],
  },
  {
    name: "Apollo Medical Center",
    type: "private",
    distance: "3.1 km",
    eta: "6 min",
    icuBeds: 3,
    generalBeds: 15,
    doctors: 8,
    specialization: "Cardiac & Neurology",
    status: "available",
    lat: 18.5074,
    lng: 73.8077,
    description: "A premier private medical center renowned for advanced cardiac surgeries and neurological interventions, featuring cutting-edge catheterization labs and neuro-diagnostic suites.",
    phone: "+91-20-2605-7890",
    email: "contact@apollomedcenter.com",
    established: "2003",
    specialties: ["Cardiology", "Neurology", "Cardiac Surgery", "Neurosurgery", "Interventional Radiology", "Electrophysiology"],
  },
  {
    name: "Metro Trauma Institute",
    type: "government",
    distance: "4.7 km",
    eta: "9 min",
    icuBeds: 1,
    generalBeds: 6,
    doctors: 4,
    specialization: "Orthopedic & Burns",
    status: "busy",
    lat: 18.559,
    lng: 73.7868,
    description: "A government-run institute specializing in orthopedic trauma and burn care, with a dedicated burns ICU and fracture management unit serving accident and industrial injury victims.",
    phone: "+91-20-2745-1122",
    email: "admin@metrotraumainstitute.gov.in",
    established: "1995",
    specialties: ["Orthopedic Surgery", "Burns & Plastic Surgery", "Physiotherapy", "Pain Management", "Reconstructive Surgery"],
  },
  {
    name: "St. Mary's Hospital",
    type: "private",
    distance: "5.2 km",
    eta: "11 min",
    icuBeds: 5,
    generalBeds: 18,
    doctors: 10,
    specialization: "Multi-Specialty Emergency",
    status: "available",
    lat: 18.4883,
    lng: 73.858,
    description: "A trusted private multi-specialty hospital offering comprehensive emergency services, advanced diagnostics, and round-the-clock specialist consultations across a wide range of medical disciplines.",
    phone: "+91-20-2634-8800",
    email: "reception@stmaryshospital.in",
    established: "1972",
    specialties: ["Emergency Medicine", "Internal Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology", "Ophthalmology", "ENT"],
  },
  {
    name: "Govt. District Hospital",
    type: "government",
    distance: "6.8 km",
    eta: "14 min",
    icuBeds: 0,
    generalBeds: 2,
    doctors: 3,
    specialization: "General Emergency",
    status: "critical",
    lat: 18.564,
    lng: 73.905,
    description: "A district-level government hospital providing basic emergency and outpatient services to the local community. Currently operating at critical capacity with limited resources.",
    phone: "+91-20-2718-5500",
    email: "govtdistricthospital@nic.in",
    established: "1964",
    specialties: ["General Medicine", "Emergency Care", "Basic Surgery", "Maternal Health", "Vaccination & Immunization"],
  },
  {
    name: "Fortis Emergency Wing",
    type: "private",
    distance: "3.9 km",
    eta: "7 min",
    icuBeds: 4,
    generalBeds: 12,
    doctors: 7,
    specialization: "Pediatric & Neonatal",
    status: "busy",
    lat: 18.517,
    lng: 73.84,
    description: "A specialized private emergency wing focused on pediatric and neonatal critical care, featuring a Level III NICU and 24-hour pediatric emergency response with child-friendly treatment facilities.",
    phone: "+91-20-2689-4321",
    email: "emergency@fortishospital.com",
    established: "2010",
    specialties: ["Pediatric Emergency", "Neonatology", "Pediatric Surgery", "Pediatric Cardiology", "Child Nutrition", "Developmental Medicine"],
  },
];

const seedHospitals = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for seeding");

    await Hospital.deleteMany();
    console.log("Cleared existing hospitals");

    await Hospital.insertMany(hospitalData);
    console.log("Successfully seeded hospitals!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedHospitals();
