const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db"); // Import existing DB connection

const createAdmin = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Check if an admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists.");
      return;
    }

    // Hash the password and create the initial admin
    const hashedPassword = await bcrypt.hash("adminpassword", 10); // Default admin password
    const admin = new User({
      name: "Admin",
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log(
      "Initial admin created with username 'admin' and password 'adminpassword'"
    );
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    // Close the database connection
    process.exit();
  }
};

// Call the function
createAdmin();
