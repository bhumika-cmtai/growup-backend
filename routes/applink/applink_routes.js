import express from "express";
import AppLinkService from "../../services/applink/applink_service.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";


const router = express.Router();


// router.post('/create', async (req, res) => {
//   try {
//     const { appName, password, link } = req.body;

    // if (!appName || !password || !link) {
    //     return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'appName, password, and link are required fields.');
    // }

    // You would typically call createPortal here. I'm adding it based on your service code.
    // Assuming you uncomment createPortal in your service, this will work.
    // If you don't have createPortal, you can instantiate the model directly, but that's not a good practice.
    // For this example, let's assume createPortal exists and is similar to this:
    /*
    async createPortal(data) {
        try {
            const portal = new AppLink(data);
            await portal.save();
            consoleManager.log("AppLink Created successfully");
            const portalObj = portal.toObject();
            delete portalObj.password; // Don't send password back in the response
            return portalObj;
        } catch (err) {
            consoleManager.error(`Error creating AppLink: ${err.message}`);
            throw err;
        }
    }
    */
//     const newAppLink = await AppLinkService.createPortal(req.body);

//     return ResponseManager.sendSuccess(res, newAppLink, 201, 'AppLink created successfully');

//   } catch (err) {
//     // Handle duplicate key error (for unique appName)
//     if (err.code === 11000) {
//       consoleManager.error(`Creation failed: appName '${req.body.appName}' already exists.`);
//       return ResponseManager.sendError(res, 409, 'CONFLICT', `The app name '${req.body.appName}' is already in use.`);
//     }
//     consoleManager.error(`Error in /applink/create route: ${err.message}`);
//     return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error creating the AppLink.');
//   }
// });

// Get all AppLinks (Admin)
router.get('/all', async (req, res) => {
    try {
        const allAppLinks = await AppLinkService.getAllAppLinks();

        // const safeAppLinks = allAppLinks.map(app => {
        //     const { password, ...rest } = app;
        //     return rest;
        // });
        // console.log(allAppLinks)

        return ResponseManager.sendSuccess(res, allAppLinks, 200, 'All AppLinks fetched successfully.');

    } catch (err) {
        consoleManager.error(`Error in /applink/all route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error fetching AppLinks.');
    }
});

// Update an AppLink by its ID (Admin)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'Request body cannot be empty for an update.');
    }
    
    // Prevent password from being updated to an empty string if passed
    if (updateData.password === '') {
        delete updateData.password;
    }

    const updatedAppLink = await AppLinkService.updateAppLinkById(id, updateData);

    if (!updatedAppLink) {
      return ResponseManager.sendError(res, 404, 'NOT_FOUND', `AppLink with ID '${id}' not found.`);
    }

    return ResponseManager.sendSuccess(res, updatedAppLink, 200, 'AppLink updated successfully');

  } catch (err) {
     // Handle duplicate key error on update
    if (err.code === 11000) {
        consoleManager.error(`Update failed: appName '${req.body.appName}' already exists.`);
        return ResponseManager.sendError(res, 409, 'CONFLICT', `The app name '${req.body.appName}' is already in use.`);
    }
    consoleManager.error(`Error in /applink/:id route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error updating AppLink data.');
  }
});

// Get a specific link by providing credentials
router.post('/get-link', async (req, res) => {
    try {
        const { appName, password } = req.body;
        
        if (!appName || !password) {
            return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'appName and password are required.');
        }

        const linkData = await AppLinkService.getLinkByCredentials(appName, password);

        if (!linkData) {
            // Use 401 for failed authentication attempts
            return ResponseManager.sendError(res, 401, 'UNAUTHORIZED', 'Invalid credentials provided.');
        }

        return ResponseManager.sendSuccess(res, linkData, 200, 'Link fetched successfully');

    } catch (err) {
        consoleManager.error(`Error in /applink/get-link route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error authenticating and fetching link.');
    }
});

export default router;