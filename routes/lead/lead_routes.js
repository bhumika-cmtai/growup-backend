import express from "express"
import LeadService from "../../services/lead/lead_services.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
const router = express.Router();

// Create a new lead
router.post('/addLead', async (req, res) => {
    try {
      // Extract fields from the request body
      // if (!req.body.name) {
      //   return ResponseManager.handleBadRequestError(res, 'Name is required');
      // }
  
      // if (!req.body.email) {
      //   return ResponseManager.handleBadRequestError(res, 'Email is required');
      // }
      
      // if (!req.body.phoneNumber) {
      //   return ResponseManager.handleBadRequestError(res, 'Primary phone is required');
      // }
  
      // if (!req.body.status) {
      //   return ResponseManager.handleBadRequestError(res, 'Status is required');
      // }
  
      // Create the laed if all required fields are present
      const lead = await LeadService.createLead(req.body);
      return ResponseManager.sendSuccess(res, lead, 201, 'Lead created successfully');
    } catch (err) {
      console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating lead');
    }
  });

//Create many leads 
router.post('/addManyLead', async (req,res)=>{
    try {
    const leadsArray = req.body;

    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'Request body must be a non-empty array of lead objects.');
    }

    const createdLeads = await LeadService.createManyLeads(leadsArray);

    const successMessage = `Successfully processed request. Created ${createdLeads.length} of ${leadsArray.length} leads.`;
    return ResponseManager.sendSuccess(res, createdLeads, 201, successMessage);

  } catch (err) {
    consoleManager.error(`Error in /addManyLeads route: ${err.message}`);
    console.log(`Error in /addManyleads route: ${err.message}`)
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred during the bulk creation process.');
  }
})


// Get a lead by ID
router.get('/getLead/:id', async (req, res) => {
  try {
    const lead = await LeadService.getLeadById(req.params.id);
    if (lead) {
      ResponseManager.sendSuccess(res, lead, 200, 'Lead retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'lead not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching lead');
  }
});

// Update a lead by ID
router.put('/updateLead/:id', async (req, res) => {
    try {
      // Extract fields from the request body
      if (!req.body.name) {
        return ResponseManager.handleBadRequestError(res, 'Name is required');
      }
  
      if (!req.body.email) {
        return ResponseManager.handleBadRequestError(res, 'Email is required');
      }

      if (!req.body.phoneNumber) {
        return ResponseManager.handleBadRequestError(res, 'Primary phone is required');
      }
  
      if (!req.body.status) {
        return ResponseManager.handleBadRequestError(res, 'Status is required');
      }
  
  
      // Update the lead if all required fields are present
      const lead = await LeadService.updateLead(req.params.id, req.body);
      if (lead) {
        return ResponseManager.sendSuccess(res, lead, 200, 'Lead updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'Lead not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating lead');
    }
  });

// Delete a lead by ID
router.delete('/deleteLead/:id', async (req, res) => {
  try {
    const lead = await LeadService.deleteLead(req.params.id);
    if (lead) {
      ResponseManager.sendSuccess(res, lead, 200, 'Lead deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'Lead not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting lead');
  }
});

router.delete('/deleteManyLeads', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'ids array is required');
    }
    const result = await LeadService.deleteManyLeads(ids);
    return ResponseManager.sendSuccess(res, result, 200, 'Leads deleted successfully');
  } catch (err) { 
    consoleManager.error(`Error in /deleteManyLeads route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting leads');
  }
});

// Get all leads
router.get('/getAllLeads', async (req, res) => {
  try {
    const {searchQuery,status ,page = 1, limit = 15 } = req.query;
    const result = await LeadService.getAllLeads(searchQuery,status, page, limit);

    if(result.length==0 || !result){
      return ResponseManager.sendSuccess(res, [], 200, 'No leads found');
    }

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res, 
      {
        leads: result.leads,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalLeads: result.totalLeads
      }, 
      200, 
      'Leads retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching leads: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching leads'
    );
  }
});


// Toggle lead status
// router.put('/removeLead/:id', async (req, res) => {
//   try {
//     const lead = await LeadService.toggleLeadStatus(req.params.id);
//     if (lead) {
//       ResponseManager.sendSuccess(res, lead, 200, 'lead status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'lead not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling lead status');
//   }
// });

router.get('/getLeadsCount', async (req, res) => {
  try {
    const count = await LeadService.getNumberOfLeads();

    return ResponseManager.sendSuccess(
      res, 
      { count: count }, 
      200, 
      'Lead count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getLeadsCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching lead count'
    );
  }
});

router.get('/getLeadByTransactionId/:transactionId', async (req, res) => {
  try {
    const lead = await LeadService.getLeadsByTransactionId(req.params.transactionId);
    if (lead) {
      return ResponseManager.sendSuccess(res, lead, 200, 'Lead retrieved successfully');
    } else {
      return ResponseManager.sendSuccess(res, [], 200, 'Lead not found for transactionId');
    }
  } catch (err) {
    consoleManager.error(`Error in /getLeadByTransactionId route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching lead by transactionId');
  }
});


export default router;