import express from "express";
import LoginService from "../../services/auth/auth_services.js"
import ResponseManager from "../../utils/responseManager.js";
import { encrypt } from "../../utils/encryptionUtils.js";

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
    const token = await LoginService.loginUser(email, password);

    // Encrypt the JWT token
    const encryptedToken = encrypt(token);

    // Send success response with the encrypted token
    ResponseManager.sendSuccess(
      res,
      { token: encryptedToken },
      200,
      "Login successful"
    );
  } catch (err) {
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error logging in user"
    );
  }
});

export default router