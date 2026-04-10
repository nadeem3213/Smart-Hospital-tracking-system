const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./connect");
const { PORT, MONGODB_URI } = require("./config");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const visitRoutes = require("./routes/visitRoutes");
const profileRoutes = require("./routes/profileRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { seedAdmin } = require("./seedAdmin");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend access
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible in routes via req.app.get('io')
app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected to WebSocket", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MediRoute API is running" });
});

connectToMongoDB(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedAdmin();
    server.listen(PORT, () => {
      console.log(`Server and Socket.io running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
