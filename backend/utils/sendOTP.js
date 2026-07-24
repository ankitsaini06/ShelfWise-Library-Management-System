import nodemailer from "nodemailer";

const sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Library Management System - Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for Library Management System is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("OTP sent successfully.");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export default sendOtp;