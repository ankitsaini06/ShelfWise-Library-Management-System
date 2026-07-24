import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("DB CONNECTED");
  } catch (error) {
    console.error("ERROR NAME:", error.name);
    console.error("ERROR MESSAGE:", error.message);
    console.error(error);
    process.exit(1);
  }
};