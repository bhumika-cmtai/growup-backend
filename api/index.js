import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "../database/db.js"
import consoleManager from "../utils/consoleManager.js"
// import cookieParser from "cookie-parser.js"

// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const connectDB = require("../database/db");
// const consoleManager = require("../utils/consoleManager");
// const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

// Connect to MongoDB (cached connection)
connectDB().catch((error) => {
  consoleManager.error(`Database connection failed: ${error.message}`);
  process.exit(1);
});

// CORS Configuration for credentialed requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all origins for development
      callback(null, true);
    },
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow credentials (cookies, HTTP authentication)
  })
);

// Middleware
app.use(express.json());
// app.use(cookieParser());

// Import routes
// const loginRoute = require("../routes/auth/login");
// const profileRoute = require("../routes/auth/profile");
import userRoute from "../routes/user/user_routes.js"
import leadRoute from "../routes/lead/lead_routes.js"
import contactRoute from "../routes/contact/contact_routes.js"
import clientRoute from "../routes/client/client_routes.js"
import loginRoute from "../routes/auth/login.js"
import sessionRoute from "../routes/session/session_routes.js"
import linkRoute from "../routes/link/link_routes.js"
import applinkRoute from "../routes/applink/applink_routes.js"
import registerationRoute from "../routes/registeration/registeration_routes.js"
import linkclickRoute from "../routes/linkclick/linkclick_routes.js"
// const userRoute = require("../routes/user/user_routes");
// const roleRoute = require("../routes/role/role_routes");


// app.use("/v2/auth", loginRoute);
// app.use("/v2/get", profileRoute);
app.use("/v1/users", userRoute);
app.use("/v1/leads", leadRoute);
app.use("/v1/contacts", contactRoute);
app.use("/v1/clients", clientRoute)
app.use("/v1/auth", loginRoute)
app.use("/v1/session", sessionRoute)
app.use("/v1/link", linkRoute)
app.use("/v1/applink", applinkRoute)
app.use("/v1/registers", registerationRoute)
app.use("/v1/linkclicks", linkclickRoute)
// app.use("/v2/role", roleRoute);


// Error handling middleware
app.use((err, req, res, next) => {
  consoleManager.error(`Server error: ${err.stack}`);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

// Start the server

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  //consoleManger changed to console.log for now
  console.log(`Server is running on port ${PORT}`);
});

export default app;
