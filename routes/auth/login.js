import express from "express";
import LoginService from "../../services/auth/auth_services.js"
import AppLinkService from "../../services/applink/applink_service.js"
import consoleManager from "../../utils/consoleManager.js";
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

    console.log(email)
    console.log(password)
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
      console.log(err)
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


router.post("/login/user", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', "Email and password are required.");
    }

    // Use the specific service method for regular users
    const { user, token } = await LoginService.loginRegularUser(email, password);
    console.log(user, token)

    ResponseManager.sendSuccess(res, { user, token }, 200, "User login successful.");

  } catch (err) {
    if (err.message === "Invalid credentials") {
      console.log(err)
      return ResponseManager.sendError(res, 401, "AUTHENTICATION_FAILED", "Invalid email or password.");
    }
    consoleManager.error(`Error in /login/user route: ${err.message}`);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "An internal server error occurred.");
  }
});


router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', "email and password are required.");
    }

    // Use the specific service method for admins
    const { user, token } = await LoginService.loginAdmin(email, password);
    
    ResponseManager.sendSuccess(res, { user, token }, 200, "Admin login successful.");

  } catch (err) {
    if (err.message === "Invalid credentials") {
      return ResponseManager.sendError(res, 401, "AUTHENTICATION_FAILED", "Invalid credentials.");
    }
    consoleManager.error(`Error in /login/admin route: ${err.message}`);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "An internal server error occurred.");
  }
});


router.post("/login/leader", async (req, res) => {
  try {
    const password = req.body.password;

    if (!password) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', "password are required.");
    }

    const portalData = await LoginService.loginPortal(password);
    
      ResponseManager.sendSuccess(res,portalData ,200, "leader login successful.");
      return;

  } catch (err) {
    if (err.message === "Invalid credentials") {
      return ResponseManager.sendError(res, 401, "AUTHENTICATION_FAILED", "Invalid credentials.");
    }
    consoleManager.error(`Error in /login/leader route: ${err.message}`);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "An internal server error occurred.");
  }
});


export default router