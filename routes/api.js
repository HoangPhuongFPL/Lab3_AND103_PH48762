const express = require("express")
const router = express.Router()
const Distributor = require("../models/distributors")
const Fruit = require("../models/fruits")
const User = require("../models/users"); // Assuming you have a User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const File = require("../models/file"); // Import model File
const multer = require("multer");
const path = require("path");
const upload = require("../config/common/upload"); // Chỉ khai báo một lần ở đầu file

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file
  },
});

// Bộ lọc file (chỉ cho phép upload ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Đổi tên biến multer để tránh trùng lặp
const uploadMulter = multer({ storage, fileFilter });

router.post("/distributors", async (req, res) => {
  try {
    const { name, address, phone } = req.body

    // Create new distributor
    const distributor = new Distributor({
      name,
      address,
      phone,
    })

    // Save to database
    await distributor.save()

    res.status(201).json({
      success: true,
      message: "Distributor added successfully",
      data: distributor,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

router.post("/fruits", async (req, res) => {
  try {
    const { name, quantity, price, status, image, description, id_distributor } = req.body


    const distributor = await Distributor.findById(id_distributor)
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "Distributor not found",
      })
    }

    // Create new fruit
    const fruit = new Fruit({
      name,
      quantity,
      price,
      status,
      image,
      description,
      id_distributor,
    })

    // Save to database
    await fruit.save()

    res.status(201).json({
      success: true,
      message: "Fruit added successfully",
      data: fruit,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Get all fruits
router.get("/fruits", async (req, res) => {
  try {
    const fruits = await Fruit.find().populate("id_distributor", "name address")

    res.status(200).json({
      success: true,
      count: fruits.length,
      data: fruits,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Get fruit by ID
router.get("/fruits/:id", async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id).populate("id_distributor", "name address")

    if (!fruit) {
      return res.status(404).json({
        success: false,
        message: "Fruit not found",
      })
    }

    res.status(200).json({
      success: true,
      data: fruit,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Get fruits by price range and sort by quantity
router.get("/fruits/filter/price", async (req, res) => {
  try {
    const { min_price, max_price } = req.query

    if (!min_price || !max_price) {
      return res.status(400).json({
        success: false,
        message: "Please provide min_price and max_price",
      })
    }

    const fruits = await Fruit.find({
      price: { $gte: min_price, $lte: max_price },
    })
      .select("name quantity price id_distributor")
      .sort({ quantity: -1 })
      .populate("id_distributor", "name")

    res.status(200).json({
      success: true,
      count: fruits.length,
      data: fruits,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Get fruits starting with A or X
router.get("/fruits/filter/name", async (req, res) => {
  try {
    const fruits = await Fruit.find({
      $or: [{ name: { $regex: "^A", $options: "i" } }, { name: { $regex: "^X", $options: "i" } }],
    })
      .select("name quantity price id_distributor")
      .populate("id_distributor", "name")

    res.status(200).json({
      success: true,
      count: fruits.length,
      data: fruits,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Update fruit by ID
router.put("/fruits/:id", async (req, res) => {
  try {
    const { name, quantity, price, status, image, description, id_distributor } = req.body

    // Check if fruit exists
    let fruit = await Fruit.findById(req.params.id)
    if (!fruit) {
      return res.status(404).json({
        success: false,
        message: "Fruit not found",
      })
    }

    // Check if distributor exists if id_distributor is provided
    if (id_distributor) {
      const distributor = await Distributor.findById(id_distributor)
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: "Distributor not found",
        })
      }
    }

    // Update fruit
    fruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      {
        name,
        quantity,
        price,
        status,
        image,
        description,
        id_distributor,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      message: "Fruit updated successfully",
      data: fruit,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete fruit by ID
router.delete("/fruits/:id", async (req, res) => {
  try {
    // Find and delete the fruit
    const fruit = await Fruit.findByIdAndDelete(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        success: false,
        message: "Fruit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fruit deleted successfully",
      data: fruit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// API upload file
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Lưu thông tin file vào MongoDB
    const fileData = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const file = await File.create(fileData);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// API upload file khác
router.post("/uploadfile", upload.single("myfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Trả về thông tin file đã upload
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "default_secret", // Fallback for development
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
});

module.exports = router
