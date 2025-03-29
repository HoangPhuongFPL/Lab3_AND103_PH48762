const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true }, // Tên gốc của file
  mimeType: { type: String, required: true },    // Loại file (image/png, image/jpeg, ...)
  size: { type: Number, required: true },        // Kích thước file (tính bằng byte)
  path: { type: String, required: true },        // Đường dẫn lưu file trên server
  uploadDate: { type: Date, default: Date.now }, // Ngày upload
});

module.exports = mongoose.model("File", fileSchema);