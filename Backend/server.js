const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Middlewares -
app.use(cors());
app.use(express.json());

// Database connect - (for local machine)
// mongoose
//   .connect("mongodb://127.0.0.1:27017/AJ")
//   .then(() => console.log("MongoDB Connected to database: AJ"))
//   .catch((err) => console.log("DB Error:", err));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AJ";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected successfully!");
    if (typeof seedMasterAdmin === "function") {
      seedMasterAdmin();
    }
  })
  .catch((err) => console.log("DB Error:", err));

//  User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "CUSTOMER",
      enum: [
        "ADMIN",
        "STORE_MANAGER",
        "INVENTORY_MANAGER",
        "DELIVERY_PARTNER",
        "SUPPORT_AGENT",
        "CUSTOMER",
      ],
    },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);


// 2. Default Master Admin Seeder (Database connect hone ke baad call karein)
const seedMasterAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "ADMIN" });
    if (!adminExists) {
      await User.create({
        name: "Main Admin",
        email: "admin@byaj.com",
        password: "Admin@123Password",
        role: "ADMIN",
        status: "active",
      });
      console.log("Master Admin ban gaya: admin@byaj.com");
    }
  } catch (error) {
    console.error("Admin seed error:", error);
  }
};
// connectDB() ke baad run karein:
// seedMasterAdmin();

//  Signup API Route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // save data in users collection
    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log("Data saved:", newUser);
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login API Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email ya password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "CUSTOMER",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
});

// Otp using nodemailer - 


const otpStore = {};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "jangidarvind943@gmail.com",
    pass: process.env.EMAIL_PASS || "hbbjkjvtjqwfxpvm",
  },
});

// Forgot Password Route - Send OTP
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "email not found!" });
    }

  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

  
    otpStore[email] = {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    //  Email send 
    const mailOptions = {
      from: '"BY AJ Support" <your-email@gmail.com>',
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This is valid for 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP aapke email par bhej diya gaya hai!" });
  } catch (error) {
    console.error("Nodemailer error:", error);
    return res.status(500).json({ message: "Email send nahi ho paya, please try again." });
  }
});

// OTP verification -

// 3. Verify OTP Route
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ message: "OTP not matched plz resend it." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email]; 
      return res.status(400).json({ message: "OTP expired resend it." });
    }

    
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP! Fill correct OTP." });
    }

   
    return res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Server error during verification." });
  }
});

// Reset Pass - 

app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password dono zaroori hain!" });
    }

   
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User nahi mila!" });
    }

  
    delete otpStore[email];

    res.status(200).json({ message: "Password successfully update ho gaya!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

// Get User Statistics (Total, Active, Inactive)
app.get("/api/users/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // inactive user count
    const inactiveUsers = await User.countDocuments({ status: "inactive" });

    // remaing users count (Active)
    const activeUsers = totalUsers - inactiveUsers;

    res.status(200).json({
      totalUsers,
      activeUsers,
      inactiveUsers,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
});

// Add User Route 
app.post("/api/users/add", async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Is email se user pehle se exist karta hai!" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "CUSTOMER",
      status: status || "active",
    });

    await newUser.save();
    res.status(201).json({ message: "User create ho gaya!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "User create fail ho gaya" });
  }
});

//  all users fetch -
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); 
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

//  User delete
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "User delete fail ho gaya" });
  }
}); 

// 1. Update/Edit User details
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true }
    );
    res.status(200).json({ message: "User update ho gaya", user: updated });
  } catch (error) {
    res.status(500).json({ message: "User update fail ho gaya" });
  }
});

// 2. Toggle Status (Active <-> Inactive)
app.patch("/api/users/:id/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User nahi mila" });

    user.status = user.status === "inactive" ? "active" : "inactive";
    await user.save();

    res.status(200).json({ message: "Status update ho gaya", status: user.status });
  } catch (error) {
    res.status(500).json({ message: "Status change fail ho gaya" });
  }
});

// 1. Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

// 2. Category Stats API
app.get("/api/categories/stats", async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments({ isDeleted: false });
    const activeCategories = await Category.countDocuments({ isDeleted: false, status: "active" });
    const inactiveCategories = await Category.countDocuments({ isDeleted: false, status: "inactive" });

    res.status(200).json({
      totalCategories,
      activeCategories,
      inactiveCategories,
    });
  } catch (error) {
    res.status(500).json({ message: "Stats fetch error" });
  }
});

// 3. Get All Categories (Non-deleted)
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// 4. Create Category
app.post("/api/categories/add", async (req, res) => {
  try {
    const { name, slug, description, image, status } = req.body;

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingCat = await Category.findOne({ slug: generatedSlug, isDeleted: false });
    if (existingCat) {
      return res.status(400).json({ message: "Category with this slug already exists!" });
    }

    const newCategory = new Category({
      name,
      slug: generatedSlug,
      description,
      image,
      status: status || "active",
    });

    await newCategory.save();
    res.status(201).json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to add category" });
  }
});

// 5. Update/Edit Category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { name, slug, description, image, status } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, image, status },
      { new: true }
    );
    res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" });
  }
});

// 6. Toggle Status (Active/Inactive)
app.patch("/api/categories/:id/status", async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    cat.status = cat.status === "inactive" ? "active" : "inactive";
    await cat.save();

    res.status(200).json({ message: "Status updated", status: cat.status });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// 7. Soft Delete Category (isDeleted: true)
app.delete("/api/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});


// 1. SubCategory Schema
const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

// 2. SubCategory Stats API
app.get("/api/subcategories/stats", async (req, res) => {
  try {
    const totalSubCategories = await SubCategory.countDocuments({ isDeleted: false });
    const activeSubCategories = await SubCategory.countDocuments({ isDeleted: false, status: "active" });
    const inactiveSubCategories = await SubCategory.countDocuments({ isDeleted: false, status: "inactive" });

    res.status(200).json({
      totalSubCategories,
      activeSubCategories,
      inactiveSubCategories,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// 3. Get All SubCategories (Populated with Parent Category Name)
app.get("/api/subcategories", async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isDeleted: false })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
});

// 4. Create SubCategory
app.post("/api/subcategories/add", async (req, res) => {
  try {
    const { name, slug, category, description, image, status } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category select karna zaroori hai!" });
    }

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/\s+/g, "-");

    const existing = await SubCategory.findOne({ slug: generatedSlug, isDeleted: false });
    if (existing) {
      return res.status(400).json({ message: "Is slug ke sath sub-category already exist karti hai!" });
    }

    const newSubCategory = new SubCategory({
      name,
      slug: generatedSlug,
      category,
      description,
      image,
      status: status || "active",
    });

    await newSubCategory.save();
    res.status(201).json({ message: "SubCategory add ho gayi!", subCategory: newSubCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to add sub-category" });
  }
});

// 5. Update/Edit SubCategory
app.put("/api/subcategories/:id", async (req, res) => {
  try {
    const { name, slug, category, description, image, status } = req.body;
    const updated = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, slug, category, description, image, status },
      { new: true }
    );
    res.status(200).json({ message: "SubCategory update ho gayi", subCategory: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update sub-category" });
  }
});

// 6. Toggle Status (Active <-> Inactive)
app.patch("/api/subcategories/:id/status", async (req, res) => {
  try {
    const sub = await SubCategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "SubCategory nahi mili" });

    sub.status = sub.status === "inactive" ? "active" : "inactive";
    await sub.save();

    res.status(200).json({ message: "Status update ho gaya", status: sub.status });
  } catch (error) {
    res.status(500).json({ message: "Status change fail ho gaya" });
  }
});

// 7. Soft Delete SubCategory
app.delete("/api/subcategories/:id", async (req, res) => {
  try {
    await SubCategory.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ message: "SubCategory delete ho gayi" });
  } catch (error) {
    res.status(500).json({ message: "Delete fail ho gaya" });
  }
});

// 1. Brand Schema
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Brand = mongoose.model("Brand", brandSchema);

// 2. Brand Stats API
app.get("/api/brands/stats", async (req, res) => {
  try {
    const totalBrands = await Brand.countDocuments();
    const activeBrands = await Brand.countDocuments({ status: "active" });
    const inactiveBrands = await Brand.countDocuments({ status: "inactive" });

    res.status(200).json({
      totalBrands,
      activeBrands,
      inactiveBrands,
    });
  } catch (error) {
    res.status(500).json({ message: "Brands stats fetch error" });
  }
});

// 3. Get All Brands
app.get("/api/brands", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch brands" });
  }
});

// 4. Create Brand
app.post("/api/brands/add", async (req, res) => {
  try {
    const { name, slug, logo, description, status } = req.body;

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingBrand = await Brand.findOne({ slug: generatedSlug });
    if (existingBrand) {
      return res.status(400).json({ message: "Is slug ke sath brand already exist karta hai!" });
    }

    const newBrand = new Brand({
      name,
      slug: generatedSlug,
      logo,
      description,
      status: status || "active",
    });

    await newBrand.save();
    res.status(201).json({ message: "Brand successfully add ho gaya!", brand: newBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to add brand" });
  }
});

// 5. Update/Edit Brand
app.put("/api/brands/:id", async (req, res) => {
  try {
    const { name, slug, logo, description, status } = req.body;
    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, slug, logo, description, status },
      { new: true }
    );
    res.status(200).json({ message: "Brand update ho gaya", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to update brand" });
  }
});

// 6. Toggle Status (Active <-> Inactive)
app.patch("/api/brands/:id/status", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand nahi mila" });

    brand.status = brand.status === "inactive" ? "active" : "inactive";
    await brand.save();

    res.status(200).json({ message: "Status update ho gaya", status: brand.status });
  } catch (error) {
    res.status(500).json({ message: "Status change fail ho gaya" });
  }
});

// 7. Delete Brand
app.delete("/api/brands/:id", async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Brand delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete brand" });
  }
});


// 1. Product Schema
const productSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    images: [{ type: String }], // Array of image URLs
    unit: { type: String, default: "piece" }, // e.g. piece, kg, box, packet
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

// 2. Product Stats API
app.get("/api/products/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });

    res.status(200).json({
      totalProducts,
      activeProducts,
      featuredProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// 3. Get All Products (Populated with Category, SubCategory, Brand)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// 4. Create Product
app.post("/api/products/add", async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      subcategory,
      brand,
      description,
      images,
      unit,
      tags,
      isFeatured,
      isActive,
    } = req.body;

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingProduct = await Product.findOne({ slug: generatedSlug });
    if (existingProduct) {
      return res.status(400).json({ message: "Is slug ke sath product already exist karta hai!" });
    }

    const newProduct = new Product({
      name,
      slug: generatedSlug,
      category,
      subcategory,
      brand,
      description,
      images: Array.isArray(images) ? images : (images ? images.split(",").map(i => i.trim()) : []),
      unit: unit || "piece",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product add ho gaya!", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Product create fail ho gaya" });
  }
});

// 5. Update Product
app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      subcategory,
      brand,
      description,
      images,
      unit,
      tags,
      isFeatured,
      isActive,
    } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,
        category,
        subcategory,
        brand,
        description,
        images: Array.isArray(images) ? images : (images ? images.split(",").map(i => i.trim()) : []),
        unit,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
      },
      { new: true }
    );

    res.status(200).json({ message: "Product update ho gaya", product: updated });
  } catch (error) {
    res.status(500).json({ message: "Product update fail ho gaya" });
  }
});

// 6. Toggle Status (isActive Toggle)
app.patch("/api/products/:id/status", async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product nahi mila" });

    prod.isActive = !prod.isActive;
    await prod.save();

    res.status(200).json({ message: "Status update ho gaya", isActive: prod.isActive });
  } catch (error) {
    res.status(500).json({ message: "Status change fail ho gaya" });
  }
});

// 7. Toggle Featured
app.patch("/api/products/:id/featured", async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product nahi mila" });

    prod.isFeatured = !prod.isFeatured;
    await prod.save();

    res.status(200).json({ message: "Featured status update ho gaya", isFeatured: prod.isFeatured });
  } catch (error) {
    res.status(500).json({ message: "Featured change fail ho gaya" });
  }
});

// 8. Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Delete fail ho gaya" });
  }
});


// 1. STORE SCHEMA
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: { type: String, required: true },
    address: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    serviceRadius: { type: Number, default: 5 }, // in Kilometers
    status: { type: String, default: "active", enum: ["active", "inactive"] },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);

// 2. STORE INVENTORY SCHEMA
const storeInventorySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      default: undefined, // 👈 null ki jagah undefined taaki validation na fase
    },
    quantity: { type: Number, required: true, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    availableQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    maxStockLevel: { type: Number, default: 500 },
    status: {
      type: String,
      default: "in_stock",
      enum: ["in_stock", "low_stock", "out_of_stock"],
    },
    lastRestockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save hook

storeInventorySchema.pre("save", function () {
  this.availableQuantity = Math.max(0, (this.quantity || 0) - (this.reservedQuantity || 0));

  if (this.availableQuantity === 0) {
    this.status = "out_of_stock";
  } else if (this.availableQuantity <= this.reorderLevel) {
    this.status = "low_stock";
  } else {
    this.status = "in_stock";
  }
});

const StoreInventory = mongoose.model("StoreInventory", storeInventorySchema);

// ----------------- STORE APIS -----------------

// Stats
app.get("/api/stores/stats", async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ status: "active" });
    const totalInventories = await StoreInventory.countDocuments();
    res.status(200).json({ totalStores, activeStores, totalInventories });
  } catch (error) {
    res.status(500).json({ message: "Store stats fetch error" });
  }
});

// Get Stores List (with Manager details)
app.get("/api/stores", async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("manager", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: "Stores fetch error" });
  }
});

// Add Store
app.post("/api/stores/add", async (req, res) => {
  try {
    const { name, code, manager, phone, address, coordinates, serviceRadius, status } = req.body;

    const existingCode = await Store.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: "Store Code already exist karta hai!" });
    } 

    const newStore = new Store({
      name,
      code: code.toUpperCase(),
      manager,
      phone,
      address,
      location: {
        type: "Point",
        coordinates: coordinates || [0, 0],
      },
      serviceRadius: Number(serviceRadius) || 5,
      status: status || "active",
    });

    await newStore.save();
    res.status(201).json({ message: "Store create ho gaya!", store: newStore });
  } catch (error) {
    res.status(500).json({ message: "Store add karne me fail hua" });
  }
});

// Update Store
app.put("/api/stores/:id", async (req, res) => {
  try {
    const { name, code, manager, phone, address, coordinates, serviceRadius, status } = req.body;
    const updated = await Store.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code: code.toUpperCase(),
        manager,
        phone,
        address,
        location: {
          type: "Point",
          coordinates: coordinates || [0, 0],
        },
        serviceRadius: Number(serviceRadius) || 5,
        status,
      },
      { new: true }
    );
    res.status(200).json({ message: "Store update ho gaya", store: updated });
  } catch (error) {
    res.status(500).json({ message: "Store update error" });
  }
});

// Delete Store
app.delete("/api/stores/:id", async (req, res) => {
  try {
    await Store.findByIdAndDelete(req.params.id);
    await StoreInventory.deleteMany({ store: req.params.id }); // Clean up inventory
    res.status(200).json({ message: "Store delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Delete error" });
  }
});

// ----------------- INVENTORY APIS -----------------

// Get All Inventory by Store
app.get("/api/inventory", async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.store = req.query.storeId;

    const inventories = await StoreInventory.find(filter)
      .populate("store", "name code")
      .populate("product", "name slug unit")
      .sort({ createdAt: -1 });
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: "Inventory fetch error" });
  }
});

// Add or Restock Inventory
app.post("/api/inventory/add", async (req, res) => {
  try {
    const { store, product, quantity, reservedQuantity, reorderLevel, maxStockLevel } = req.body;

    // Validation: Check ID validity
    if (!store || !product) {
      return res.status(400).json({ message: "Store aur Product dono select karna zaroori hai!" });
    }

    let item = await StoreInventory.findOne({ store, product });

    if (item) {
      // Existing item restock
      item.quantity += Number(quantity) || 0;
      if (reorderLevel !== undefined) item.reorderLevel = Number(reorderLevel);
      if (maxStockLevel !== undefined) item.maxStockLevel = Number(maxStockLevel);
      item.lastRestockedAt = new Date();
      await item.save();
      return res.status(200).json({ message: "Stock successfully restock ho gaya!", inventory: item });
    }

    // New inventory item
    item = new StoreInventory({
      store,
      product,
      quantity: Number(quantity) || 0,
      reservedQuantity: Number(reservedQuantity) || 0,
      reorderLevel: Number(reorderLevel) || 10,
      maxStockLevel: Number(maxStockLevel) || 500,
    });

    await item.save();
    res.status(201).json({ message: "Inventory successfully create ho gayi!", inventory: item });
  } catch (error) {
    // Exact error terminal mein print hoga
    console.error("INVENTORY ERROR DETAILS:", error);
    res.status(500).json({ message: error.message || "Inventory create error" });
  }
});



// 5. Server listen (Dynamic port for Render + Local fallback)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});