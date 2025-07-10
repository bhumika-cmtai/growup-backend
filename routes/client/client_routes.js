import express from "express"
import ClientService from "../../services/client/client_services.js";

import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new user
router.post('/addClient', async (req, res) => {
    try {
      const client = await ClientService.createClient(req.body);
      return ResponseManager.sendSuccess(res, client, 201, 'client created successfully');
    } 
    catch (err) {
    if (err.statusCode) {
      return ResponseManager.sendError(res, err.statusCode, 'phone_number_exist', err.message);
    } else {
      console.error(err); 
      console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred while creating the client.');
    }
    
  }
  });


// Get a client by ID
router.get('/getClient/:id', async (req, res) => {
  try {
    const client = await ClientService.getClientById(req.params.id);
    if (client) {
      ResponseManager.sendSuccess(res, client, 200, 'client retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'client not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching client');
  }
});

// Update a client by ID
router.put('/updateClient/:id', async (req, res) => {
    try {
  
      const client = await ClientService.updateClient(req.params.id, req.body);
      if (client) {
        return ResponseManager.sendSuccess(res, client, 200, 'client updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'client not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating client');
    }
  });

// Delete a client by ID
router.delete('/deleteClient/:id', async (req, res) => {
  try {
    const client = await ClientService.deleteClient(req.params.id);
    if (client) {
      ResponseManager.sendSuccess(res, client, 200, 'client deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'client not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting client');
  }
});

router.delete('/deleteManyClients', async (req, res) => {
  try {
    const { clientIds } = req.body;
    const result = await ClientService.deleteManyClients(clientIds);  
    return ResponseManager.sendSuccess(res, result, 200, 'Clients deleted successfully');
  } catch (err) {
    consoleManager.error(`Error in /deleteManyClients route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting clients');
  }
});


// Get all client
router.get('/getAllClient', async (req, res) => {
  try {
    const { searchQuery, phoneNumber, portalName, status, page = 1, limit = 8 } = req.query;
    const result = await ClientService.getAllClients(searchQuery, phoneNumber, portalName, status, page, limit);

    return ResponseManager.sendSuccess(
      res, 
      {
        clients: result.clients,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalClients: result.totalClients
      }, 
      200, 
      'client retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching client: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching client');
  }
});

// NEW: Route to get portal names
router.get('/getPortalNames', async (req, res) => {
  try {
    const portalNames = await ClientService.getAllPortalNames();
    return ResponseManager.sendSuccess(res, portalNames, 200, 'Portal names retrieved successfully');
  } catch (err) {
    consoleManager.error(`Error in /getPortalNames route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching portal names');
  }
});


router.get('/getClientsCount', async (req, res) => {
  try {
    const count = await ClientService.getNumberOfClients();

    return ResponseManager.sendSuccess(
      res, 
      { count: count }, 
      200, 
      'clients count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getClientsCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching client count'
    );
  }
})

// // Toggle client status
// router.put('/removeClient/:id', async (req, res) => {
//   try {
//     const client = await ClientService.toggleUserStatus(req.params.id);
//     if (client) {
//       ResponseManager.sendSuccess(res, client, 200, 'client status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'client not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling client status');
//   }
// });

router.post('/getClientsCountByDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Basic validation
    if (!startDate || !endDate) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'Both startDate and endDate are required in the request body.');
    }

    const count = await ClientService.getClientsCountByDateRange(startDate, endDate);
    
    const responseData = {
      count: count,
      startDate: startDate,
      endDate: endDate
    };

    return ResponseManager.sendSuccess(res, responseData, 200, 'Client count retrieved successfully for the specified date range.');

  } catch (err) {
    consoleManager.error(`Error in /getClientsCountByDate route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching client count by date range.');
  }
});

router.get('/getClientsByOwner/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Basic validation
    if (!phoneNumber) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'Owner phone number is required.');
    }

    const groupedClients = await ClientService.getClientsByOwnerNumber(phoneNumber);
    
    // If the service returns an array (even an empty one), the operation was successful.
    if (groupedClients && groupedClients.length > 0) {
      return ResponseManager.sendSuccess(res, groupedClients, 200, 'Owner\'s clients retrieved and grouped by portal successfully.');
    } else {
      // It's correct to return an empty array if the user has no assigned clients.
      return ResponseManager.sendSuccess(res, [], 200, 'No clients found for the specified owner.');
    }

  } catch (err) {
    consoleManager.error(`Error in /getClientsByOwner route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred while fetching clients by owner.');
  }
});

router.post('/:clientId/distribute-commission', async (req, res) => {
    try {
        const { clientId } = req.params;
        const { commission } = req.body;

        // Basic validation
        if (!commission || typeof commission !== 'number' || commission <= 0) {
            return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'A valid, positive commission amount is required in the request body.');
        }

        const result = await ClientService.distributeCommission(clientId, commission);

        return ResponseManager.sendSuccess(res, result, 200, 'Commission distributed successfully.');

    } catch (err) {
        // Handle specific errors from the service layer
        console.log(err)
        if (err.statusCode) {
            const errorCode = err.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST';
            return ResponseManager.sendError(res, err.statusCode, errorCode, err.message);
        }

        consoleManager.error(`Error in /distribute-commission route: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    }
});

router.post('/addManyClient', async (req,res)=>{
    try {
    const clientArray = req.body;

    if (!Array.isArray(clientArray) || clientArray.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'Request body must be a non-empty array of client objects.');
    }

    const createdClients = await ClientService.createManyClients(clientArray);

    const successMessage = `Successfully processed request. Created ${createdClients.length} of ${clientArray.length} leads.`;
    return ResponseManager.sendSuccess(res, createdClients, 201, successMessage);

  } catch (err) {
    consoleManager.error(`Error in /addManyClient route: ${err.message}`);
    console.log(`Error in /addManyClient route: ${err.message}`)
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred during the bulk creation process.');
  }
})




export default router;