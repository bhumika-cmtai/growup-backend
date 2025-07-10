import express from "express"
import LinkClickService from "../../services/linkclick/linkclick_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new user
router.post('/addLinkclick', async (req, res) => {
    try {
      const linkclick = await LinkClickService.createLinkClick(req.body);
      return ResponseManager.sendSuccess(res, linkclick, 201, 'linkclick created successfully');
    } 
    catch (err) {
    if (err.statusCode) {
      return ResponseManager.sendError(res, err.statusCode, 'phone_number_exist', err.message);
    } else {
      console.error(err); 
      console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred while creating the linkclick.');
    }
    
  }
  });


// Get a linkclick by ID
router.get('/getLinkclick/:id', async (req, res) => {
  try {
    const linkclick = await LinkClickService.getLinkClickById(req.params.id);
    if (linkclick) {
      ResponseManager.sendSuccess(res, linkclick, 200, 'linkclick retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'linkclick not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching linkclick');
  }
});

// Update a linkclick by ID
router.put('/updateLinkclick/:id', async (req, res) => {
    try {
  
      const linkclick = await LinkClickService.updateLinkClick(req.params.id, req.body);
      if (linkclick) {
        return ResponseManager.sendSuccess(res, linkclick, 200, 'linkclick updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'linkclick not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating linkclick');
    }
  });

// Delete a linkclick by ID
router.delete('/deleteLinkclick/:id', async (req, res) => {
  try {
    const linkclick = await LinkClickService.deleteLinkClick(req.params.id);
    if (linkclick) {
      ResponseManager.sendSuccess(res, linkclick, 200, 'linkclick deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'linkclick not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting linkclick');
  }
});

router.delete('/deleteManyLinkclicks', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'ids array is required');
    }
    const result = await LinkClickService.deleteManyLinkClicks(ids);
    return ResponseManager.sendSuccess(res, result, 200, 'Linkclicks deleted successfully');
  } catch (err) { 
    consoleManager.error(`Error in /deleteManyLinkclicks route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting linkclicks');
  }
});

// Get all linkclick
router.get('/getAllLinkclick', async (req, res) => {
  try {
    const { name, phoneNumber, portalName,leaderCode ,status, page = 1, limit = 15 } = req.query;
    const result = await LinkClickService.getAllLinkClicks(name, phoneNumber,portalName, leaderCode,status, page, limit);

    return ResponseManager.sendSuccess(
      res, 
      {
        linkclicks: result.linkclicks,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalLinkclicks: result.totalLinkclicks
      }, 
      200, 
      'linkclick retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching linkclick: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching linkclick');
  }
});

// NEW: Route to get portal names
router.get('/getPortalNames', async (req, res) => {
  try {
    const portalNames = await LinkClickService.getAllPortalNames();
    return ResponseManager.sendSuccess(res, portalNames, 200, 'Portal names retrieved successfully');
  } catch (err) {
    consoleManager.error(`Error in /getPortalNames route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching portal names');
  }
});


router.get('/getLinkclicksCount', async (req, res) => {
  try {
    const count = await LinkClickService.getNumberOfLinkClicks();

    return ResponseManager.sendSuccess(
      res, 
      { count: count }, 
      200, 
      'linkclicks count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getLinkclicksCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching linkclick count'
    );
  }
})

// // Toggle linkclick status
// router.put('/removeLinkclick/:id', async (req, res) => {
//   try {
//     const linkclick = await LinkClickService.toggleUserStatus(req.params.id);
//     if (linkclick) {
//       ResponseManager.sendSuccess(res, linkclick, 200, 'linkclick status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'linkclick not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling linkclick status');
//   }
// });


export default router;