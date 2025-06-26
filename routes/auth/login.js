import express from "express";
import LoginService from "../../services/auth/auth_services.js"
import ResponseManager from "../../utils/responseManager.js";
// import { encrypt } from "../../utils/encryptionUtils.js";

const router = express.Router();

// User login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return ResponseManager.handleBadRequestError(
        res,
        "Email and password are required"
      );
    }

    // Login the user and generate JWT token
    const {user,token} = await LoginService.loginUser(email, password);

    // Encrypt the JWT token
    // const encryptedToken = encrypt(token);

    // Send success response with the encrypted token
    ResponseManager.sendSuccess(
      res,
      {user, token },
      200,
      "Login successful"
    );
  } catch (err) {
    if (err.message === "Invalid credentials") {
      return ResponseManager.sendError(
        res,
        401, 
        "AUTHENTICATION_FAILED",
        "Invalid email or password. Please try again."
      );
    }

    // Handle other unexpected errors
    consoleManager.error(`Unhandled error in login route: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "An internal server error occurred during login."
    );

  }
});

export default router