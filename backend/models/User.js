import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    department: {
      type: String,
      default: "",
    },

    stream: {
      type: String,
      default: "",
    },

    semester: {
      type: String,
      default: "",
    },

    academicYear: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      default: "",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;