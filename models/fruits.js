const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["Còn hàng", "Hết hàng", "Available", "Out of stock"] 
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  id_distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "distributors",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("fruits", fruitSchema);
