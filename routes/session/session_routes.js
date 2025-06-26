// routes/session/globalSessionRoutes.js

import express from "express";
import sessionServices from "../../services/session/session_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// A simple middleware to check for admin role. Place this in your middleware folder.
const adminMiddleware = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return ResponseManager.sendError(res, 403, 'FORBIDDEN_ACCESS', 'Access is restricted to administrators.');
  }
};


/**
 * GET /api/global-session
 * @description Get the site-wide global session details.
 * @access Private (All authenticated users)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const session = await sessionServices.getGlobalSession();
    
    // If no session is set yet, it's not an error. Send success with null data.
    return ResponseManager.sendSuccess(res, session, 200, 'Global session retrieved successfully');

  } catch (err) {
    consoleManager.error(`Error in GET /global-session route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching global session');
  }
});


/**
 * PUT /api/global-session
 * @description Update the site-wide global session details.
 * @access Private (ADMINS ONLY)
 */
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Extract only the allowed fields from the request body to prevent unwanted updates
    const { sessionStartDate, sessionStartTime, sessionEndDate, sessionEndTime, isActive } = req.body;

    const sessionData = { 
      sessionStartDate, 
      sessionStartTime, 
      sessionEndDate, 
      sessionEndTime,
      isActive,
    };

    const updatedSession = await sessionServices.updateGlobalSession(sessionData);

    return ResponseManager.sendSuccess(res, updatedSession, 200, 'Global session updated successfully.');

  } catch (err) {
    consoleManager.error(`Error in PUT /global-session route: ${err.message}`);
    // Handle validation errors specifically if the model returns them
    if (err.name === 'ValidationError') {
        return ResponseManager.sendError(res, 400, 'VALIDATION_ERROR', err.message);
    }
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating global session');
  }
});

export default router;