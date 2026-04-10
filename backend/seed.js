require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const hospitalsData = require('../hospitals_dataset.json');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas for seeding');

    try {
      // Clear existing hospitals (optional, you can remove this if you want to keep old data)
      await Hospital.deleteMany({});
      console.log('Cleared existing hospital data');

      // Insert new data
      await Hospital.insertMany(hospitalsData);
      console.log('Successfully seeded Pune hospitals!');

      // Close the connection
      mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      console.error('Error seeding data:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
