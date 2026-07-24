import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import bookRouter from "./routes/bookRoutes.js"; // ✅ ADD THIS

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Shelfwise Library API is Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/books", bookRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});