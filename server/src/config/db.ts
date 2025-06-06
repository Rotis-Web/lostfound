import mongoose from "mongoose";
import { config } from "../config/app.config";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ Error connecting to MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;
