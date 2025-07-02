import express from "express";
import JoinlinkService from "../../services/joinlink/joinlink_services.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";


const router = express.Router();

// Get all Joinlinks (Admin)
router.get('/all', async (req, res) => {
    try {
        const allJoinlinks = await JoinlinkService.getAllJoinlinks();

        return ResponseManager.sendSuccess(res, allJoinlinks, 200, 'All Joinlinks fetched successfully.');

    } catch (err) {
        consoleManager.error(`Error in /joinlink/all route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error fetching Joinlinks.');
    }
});

// Update an Joinlink by its ID (Admin)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { link } = req.body;

        if (!link) {
            return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'The "link" field is required for update.');
        }

        const updatedJoinlink = await JoinlinkService.updateJoinlinkById(id, { link });

        if (!updatedJoinlink) {
            return ResponseManager.sendError(res, 404, 'NOT_FOUND', `Joinlink with ID '${id}' not found.`);
        }

        return ResponseManager.sendSuccess(res, updatedJoinlink, 200, 'Joinlink link updated successfully');

    } catch (err) {
        // Handle duplicate key error on update
        if (err.code === 11000) {
            consoleManager.error(`Update failed: duplicate key error.`);
            return ResponseManager.sendError(res, 409, 'CONFLICT', `Duplicate key error.`);
        }
        consoleManager.error(`Error in /joinlink/:id route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error updating Joinlink link.');
    }
});

// Get a specific link by providing name
router.post('/get-link', async (req, res) => {
    try {
        const appName  = req.body.appName;
        
        if (!appName) {
            return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'appName required.');
        }

        const linkData = await JoinlinkService.getLinkByAppName(appName);

        if (!linkData) {
            // Use 401 for failed authentication attempts
            return ResponseManager.sendError(res, 401, 'UNAUTHORIZED', 'Invalid credentials provided.');
        }

        return ResponseManager.sendSuccess(res, linkData, 200, 'Link fetched successfully');

    } catch (err) {
        consoleManager.error(`Error in /joinlink/get-link route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error authenticating and fetching link.');
    }
});

export default router;