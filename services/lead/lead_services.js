import Lead from "../../models/lead/leadModel.js"
import consoleManager from "../../utils/consoleManager.js";

class LeadService {
  async createLead(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      data.createdOn =  Date.now();
      data.updatedOn =  Date.now();

      const lead = new Lead(data);
      await lead.save();
      consoleManager.log("Lead created successfully");
      return lead;
    } catch (err) {
      consoleManager.error(`Error creating lead: ${err.message}`);
      throw err;
    }
  }
  async createManyLeads(leadsDataArray) {
  try {
    // Validate that the input is a non-empty array
    if (!Array.isArray(leadsDataArray) || leadsDataArray.length === 0) {
      throw new Error("Input must be a non-empty array of lead data.");
    }

    const now = Date.now(); // Get the current time once for consistency across all leads

    //  add timestamps 
    const leadsToInsert = leadsDataArray.map(leadDoc => ({
      ...leadDoc,          
      createdOn: now,      
      updatedOn: now,      
    }));

    
    const createdLeads = await Lead.insertMany(leadsToInsert, { ordered: false });

    consoleManager.log(`Successfully created ${createdLeads.length} leads.`);
    return createdLeads;
    
  } catch (err) {
    consoleManager.error(`Error creating leads in bulk: ${err.message}`);
    throw err; // Re-throw the error to be caught by the route handler
  }
}

  async getLeadById(leadId) {
    try {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        consoleManager.error("Lead not found");
        return null;
      }
      return lead;
    } catch (err) {
      consoleManager.error(`Error fetching lead: ${err.message}`);
      throw err;
    }
  }

  async updateLead(leadId, data) {
    try {
      data.updatedOn = Date.now();
      const lead = await Lead.findByIdAndUpdate(leadId, data, { new: true });
      if (!lead) {
        consoleManager.error("Lead not found for update");
        return null;
      }
      consoleManager.log("Lead updated successfully");
      return lead;
    } catch (err) {
      consoleManager.error(`Error updating lead: ${err.message}`);
      throw err;
    }
  }

  async deleteLead(leadId) {
    try {
      const lead = await Lead.findByIdAndDelete(leadId);
      if (!lead) {
        consoleManager.error("Lead not found for deletion");
        return null;
      }
      consoleManager.log("Lead deleted successfully");
      return lead;
    } catch (err) {
      consoleManager.error(`Error deleting lead: ${err.message}`);
      throw err;
    }
  }

  async getAllLeads(searchQuery = '',status ,page = 1, limit = 8) {
    try {
      // Build the query object for filtering
      const filterQuery = {};
      
      if (searchQuery) {
      const regex = { $regex: searchQuery, $options: 'i' };
      filterQuery.$or = [
        { name: regex },
        { email: regex }
      ];
    }
  if (status) {
        filterQuery.status = status;
      }
      // Fetch leads with pagination
      const leads = await Lead.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of leads for pagination
      const totalLeads = await Lead.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalLeads / limit);
  
      return {
        leads, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalLeads
      };
    } catch (err) {
      consoleManager.error(`Error fetching leads: ${err.message}`);
      throw err;
    }
  }
  

  async getNumberOfLeads() {
    try {
      const count = await Lead.countDocuments();
      consoleManager.log(`Number of leads: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting leads: ${err.message}`);
      throw err;
    }
  }





}

export default new LeadService();