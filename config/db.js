const mongoose = require("mongoose")

const mongoURI =
  "mongodb+srv://phuongph:phuong123@and103.bxyzy.mongodb.net/?retryWrites=true&w=majority&appName=AND103"

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
