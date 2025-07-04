
import express from "express";
// import RestartDateService from "../../services/restartdate/restartdate_services.js"; // Adjust path as needed
import RestartDateService from "../../services/restartDate/restartdate_services.js"
import ResponseManager from "../../utils/responseManager.js"; // Adjust path as needed
import consoleManager from "../../utils/consoleManager.js"; // Adjust path as needed

const router = express.Router();
router.get('/get', async (req, res) => {
  try {
    const setting = await RestartDateService.getRestartDate();
    
    if (setting) {
      // If the date is found, send it back
      return ResponseManager.sendSuccess(res, setting, 200, 'Restart date retrieved successfully');
    } else {
      // If the date has not been set, it's not an error. Send a success response with null data.
      return ResponseManager.sendSuccess(res, null, 200, 'Restart date has not been set yet');
    }
  } catch (err) {
    consoleManager.error(`Error in GET /restart-date/get route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching restart date');
  }
});

/**
 * @route   POST /restart-date/set
 * @desc    Create or update the global restart date
 * @access  Private (e.g., requires admin role)
 */
router.post('/set', async (req, res) => {
  try {
    const { restartDate } = req.body;

    // --- Validation ---
    if (!restartDate) {
        // Assuming ResponseManager.handleBadRequestError sends a 400 response
        // If not, you can use ResponseManager.sendError with a 400 status.
        return ResponseManager.sendError(res, 400, 'VALIDATION_ERROR', 'restartDate is a required field.');
    }
    // Check if the provided value can be parsed into a valid date
    if (isNaN(new Date(restartDate).getTime())) {
        return ResponseManager.sendError(res, 400, 'VALIDATION_ERROR', 'The provided restartDate is not a valid date.');
    }
    
    // Call the service to create or update the date
    const updatedSetting = await RestartDateService.setRestartDate(restartDate);
    
    // Send a success response with the updated data
    return ResponseManager.sendSuccess(res, updatedSetting, 200, 'Restart date has been set successfully');

  } catch (err) {
    consoleManager.error(`Error in POST /restart-date/set route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error setting restart date');
  }
});

export default router;