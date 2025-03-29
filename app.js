const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");
const uploadRoutes = require("./routes/api"); // Đường dẫn tới file routes/api.js

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);
app.use("/", uploadRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Fruit Management API");
});


module.exports = app;
