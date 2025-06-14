import mongoose from "mongoose";
import consoleManager from "../utils/consoleManager.js"
import dotenv from "dotenv"
// const consoleManager = require("../utils/consoleManager");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "growup",
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 30000, 
        serverSelectionTimeoutMS: 30000, 
      }
    );
    consoleManager.log("MongoDB connected successfully");
  } catch (err) {
    consoleManager.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;