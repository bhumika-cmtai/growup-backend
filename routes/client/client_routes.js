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
      return ResponseManager.sendError(res, err.statusCode, 'EMAIL_ALREADY_EXISTS', err.message);
    } else {
      console.error(err); 
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

// Get all client
router.get('/getAllClient', async (req, res) => {
  try {
    const { searchQuery, status, page = 1, limit = 8 } = req.query;
    const result = await ClientService.getAllClients(searchQuery, status, page, limit);

    // Format the response as needed
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
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching client'
    );
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

export default router;