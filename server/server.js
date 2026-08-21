const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const waitingListRoutes = require("./routes/waitingListRoutes");
const officerApplicationRoutes = require("./routes/officerApplicationRoutes");
const allotmentRoutes = require("./routes/allotmentRoutes");

const app = express();

// ================================
// Middleware
// ================================

app.use(cors());
app.use(express.json());


// ================================
// Test Route
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "State Housing Board API is running",
  });
});


// ================================
// Authentication Routes
// ================================

app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/waiting-list", waitingListRoutes);
app.use("/api/officer/applications", officerApplicationRoutes);
app.use("/api/allotments", allotmentRoutes);

// ================================
// MongoDB Connection
// ================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server running on port ${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:");
    console.error(error.message);
  });