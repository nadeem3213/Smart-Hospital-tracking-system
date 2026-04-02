const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./connect");
const authRoutes = require("./routes/authRoutes");
const visitRoutes = require("./routes/visitRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MediRoute API is running" });
});

connectToMongoDB("mongodb://127.0.0.1:27017/Smart-tracker")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
