import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import sendOtp from "../utils/sendOTP.js";

// ======================= REGISTER =======================
export async function registerUser(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanPhone = phone.toString().replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const phoneExists = await User.findOne({ phone: cleanPhone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      name,
      email,
      phone: cleanPhone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOtp(email, otp);

    res.status(201).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// ======================= VERIFY OTP =======================
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// ======================= COMPLETE PROFILE =======================
export async function completeProfile(req, res) {
  try {
    const {
      email,
      department,
      stream,
      semester,
      year,
      rollNo,
    } = req.body;

    // Validation
    if (
      !email ||
      !department ||
      !stream ||
      !semester ||
      !year ||
      !rollNo
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check Email Verification
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    // Check if profile already completed
    if (user.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: "Profile already completed.",
      });
    }

    // Generate Student ID
    const studentId = `LIB${Date.now()}`;

    // Update Profile
    user.department = department;
    user.stream = stream;
    user.semester = semester;
    user.year = year;
    user.rollNo = rollNo;
    user.studentId = studentId;
    user.isProfileComplete = true;

    await user.save();

    const userData = user.toObject();

delete userData.password;
delete userData.otp;
delete userData.otpExpiry;

res.status(200).json({
  success: true,
  message: "Profile completed successfully.",
  user: userData,
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// ======================= LOGIN =======================
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userData = user.toObject();

delete userData.password;
delete userData.otp;
delete userData.otpExpiry;

res.status(200).json({
  success: true,
  message: "Login successful.",
  token,
  user: userData,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// ======================= GET PROFILE =======================
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id)
    .select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// ======================= UPDATE PROFILE =======================
export async function updateProfile(req, res) {
  try {
    const {
      name,
      email,
      phone,
      department,
      stream,
      semester,
      academicYear,
      rollNumber,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail !== user.email.toLowerCase()) {
        if (user.role === "user") {
          return res.status(400).json({
            message: "Students are not allowed to change their email address",
          });
        }

        if (
          await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id },
          })
        ) {
          return res.status(400).json({
            message: "Email already in use",
          });
        }

        user.email = normalizedEmail;
      }
    }

    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, "");

      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          message: "Mobile number must be exactly 10 digits",
        });
      }

      user.phone = cleanPhone;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (stream) user.stream = stream;
    if (semester) user.semester = semester;
    if (academicYear) user.year = academicYear;
    if (rollNumber) user.rollNo = rollNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
}

// ======================= GET ALL STUDENTS (ADMIN) =======================
export async function getUsers(req, res) {
  try {
    const users = await User.find({
      role: "user",
      isVerified: true,
      isProfileComplete: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
}

// ======================= REGISTER ADMIN =======================
export async function registerAdmin(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanPhone = phone.toString().replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        message: "Mobile number must be exactly 10 digits",
      });
    }

    const existingAdmin = await User.findOne({
      $or: [{ email }, { phone: cleanPhone }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isProfileComplete: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error registering admin",
      error: error.message,
    });
  }
}