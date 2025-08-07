import consoleManager from "../../utils/consoleManager.js";
import Client from "../../models/client/clientModal.js";
import UserService from "../../services/user/user_services.js"

class ClientService {
  async createClient(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      const existingClient = await Client.findOne({phoneNumber: data.phoneNumber})
      
      if (existingClient) {
        const error = new Error("A client with this phone Number already exists.");
        error.statusCode = 409; 
        throw error;
      }

      data.createdOn =  Date.now();

      const client = new Client(data);
      await client.save();
      consoleManager.log("Client created successfully");
      return client;
    } catch (err) {
      consoleManager.error(`Error creating client: ${err.message}`);
      throw err;
    }
  }

  async createManyClients(clientsDataArray) {
    try {
      // Validate that the input is a non-empty array
      if (!Array.isArray(clientsDataArray) || clientsDataArray.length === 0) {
        throw new Error("Input must be a non-empty array of client data.");
      }
  
      const now = Date.now(); // Get the current time once for consistency across all clients
  
      //  add timestamps 
      const clientsToInsert = clientsDataArray.map(clientDoc => ({
        ...clientDoc,          
        createdOn: now,      
        updatedOn: now,      
      }));
  
      
      const createdClients = await User.insertMany(clientsToInsert, { ordered: false });
  
      consoleManager.log(`Successfully created ${createdClients.length} clients.`);
      return createdClients;
      
    } catch (err) {
      consoleManager.error(`Error creating clients in bulk: ${err.message}`);
      throw err; // Re-throw the error to be caught by the route handler
    }
  }


  async getClientById(clientId) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        consoleManager.error("client not found");
        return null;
      }
      return client;
    } catch (err) {
      consoleManager.error(`Error fetching client: ${err.message}`);
      throw err;
    }
  }

  async updateClient(clientId, data) {
    try {
      data.updatedOn = Date.now();
      const client = await Client.findByIdAndUpdate(clientId, data, { new: true });
      if (!client) {
        consoleManager.error("client not found for update");
        return null;
      }
      consoleManager.log("client updated successfully");
      return client;
    } catch (err) {
      consoleManager.error(`Error updating client: ${err.message}`);
      throw err;
    }
  }

  async deleteClient(clientId) {
    try {
      const client = await Client.findByIdAndDelete(clientId);
      if (!client) {
        consoleManager.error("client not found for deletion");
        return null;
      }
      consoleManager.log("client deleted successfully");
      return client;
    } catch (err) {
      consoleManager.error(`Error deleting client: ${err.message}`);
      throw err;
    }
  }

  async deleteManyClients(clientIds) {
    try {
      const result = await Client.deleteMany({ _id: { $in: clientIds } });
      consoleManager.log(`Deleted ${result.deletedCount} clients.`);
      return result;
    } catch (err) { 
      consoleManager.error(`Error deleting clients: ${err.message}`);
      throw err;
    }
  }
  

 async getAllClients(name = '', phoneNumber = '', portalName = '', status, page = 1, limit = 15, exporting = false) {
    try {
        const filterQuery = {};

        if (phoneNumber) {
            filterQuery.phoneNumber = { $regex: `^${phoneNumber}$`, $options: 'i' };
        }

        if (portalName && portalName !== 'all') { // Ensure 'all' doesn't filter
            filterQuery.portalName = portalName;
        }

        if (status && status !== 'all') { // Ensure 'all' doesn't filter
            filterQuery.status = status;
        }
        if (name) {
            filterQuery.name = { $regex: name, $options: 'i' };
        }

        // If 'exporting' is true, we don't apply limit and skip
        if (exporting) {
            const clients = await Client.find(filterQuery).sort({ createdOn: -1 }); // Get all matching clients
            return {
                clients,
                totalPages: 1,
                currentPage: 1,
                totalClients: clients.length
            };
        }

        // --- Original Pagination Logic for UI display ---
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);

        const clients = await Client.find(filterQuery)
            .sort({ createdOn: -1 }) // Added sorting for consistency
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const totalClients = await Client.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalClients / limitNum);

        return {
            clients,
            totalPages,
            currentPage: pageNum,
            totalClients
        };
    } catch (err) {
        consoleManager.error(`Error fetching clients: ${err.message}`);
        throw err;
    }
}
  
  async getAllPortalNames() {
    try {
      const portalNames = await Client.distinct('portalName');
      consoleManager.log("Portal names retrieved successfully");
      // Filter out any null, undefined, or empty string values
      return portalNames.filter(name => name);
    } catch (err) {
      consoleManager.error(`Error fetching portal names: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfClients() {
    try {
      const count = await Client.countDocuments();
      consoleManager.log(`Number of leads: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting clients: ${err.message}`);
      throw err;
    }
  }

  async getClientsCountByDateRange(startDate, endDate) {
    try {
      const startTimestamp = new Date(startDate).setUTCHours(0, 0, 0, 0);

      // To include the entire endDate, we get the start of the *next* day.
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      const endTimestamp = endOfDay.getTime();

      const filter = {
        createdOn: {
          $gte: String(startTimestamp), 
          $lte: String(endTimestamp)   
        }
      };
      
      /*
      // --- This is the SIMPLER logic if you change `createdOn` to type: Date ---
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const filter = {
          createdOn: {
              $gte: startOfDay,
              $lte: endOfDay
          }
      };
      */

      const count = await Client.countDocuments(filter);
      consoleManager.log(`Found ${count} clients created between ${startDate} and ${endDate}`);
      return count;

    } catch (err) {
      consoleManager.error(`Error counting clients by date range: ${err.message}`);
      throw err;
    }
  }

async getClientsByOwnerNumber(phoneNumber) {
    try {
      const aggregationPipeline = [
        // Stage 1: Find all clients where the user's 'phoneNumber' 
        // is present in the 'ownerNumber' array.
        {
          $match: {
            ownerNumber: phoneNumber
          }
        },
        // Stage 2: Group the found documents by the 'portalName' field.
        {
          $group: {
            _id: "$portalName", // The field to group by
            clients: { $push: "$$ROOT" } // Create an array called 'clients' with all documents in the group
          }
        },
        // Stage 3 (Optional but recommended): Format the output to be cleaner.
        {
          $project: {
            _id: 0, // Remove the default _id field from the group
            portalName: "$_id", // Rename _id to portalName
            clients: "$clients" // Keep the clients array
          }
        }
      ];

      const groupedClients = await Client.aggregate(aggregationPipeline);
      
      consoleManager.log(`Successfully found and grouped clients for owner: ${phoneNumber}`);
      return groupedClients;

    } catch (err) {
      consoleManager.error(`Error fetching clients by owner number: ${err.message}`);
      throw err; // Re-throw the error to be handled by the route controller
    }
  }

  async distributeCommission(clientId, totalCommission) {
        // 1. Find the client
        const client = await Client.findById(clientId).lean();
        if (!client) {
            const error = new Error('Client not found.');
            error.statusCode = 404;
            throw error;
        }

        // 2. Get the owners and validate
        const ownerNumbers = client.ownerNumber;
        if (!ownerNumbers || ownerNumbers.length === 0) {
            const error = new Error('This client has no owners to receive a commission.');
            error.statusCode = 422; // Unprocessable Entity, as the action cannot be performed
            throw error;
        }

        // 3. Calculate the share for each owner after deducting 12% from the totalCommission
        const commissionAfterCut = totalCommission * 0.88; // 12% cut
        const commissionShare = commissionAfterCut / ownerNumbers.length;

        // 4. Call the UserService to update the incomes
        const updateResult = await UserService.updateIncomesForMultipleUsers(ownerNumbers, commissionShare);
        await Client.findByIdAndUpdate(clientId, { 
                $set: { isApproved: true } 
              });
    consoleManager.log(`Client ${clientId} marked as approved.`);


        return {
            message: `Commission of ${totalCommission} distributed among ${ownerNumbers.length} owners.`,
            paidPerOwner: commissionShare.toFixed(2),
            ownersPaidCount: updateResult.modifiedCount,
            totalOwnersInList: ownerNumbers.length,
        };
    }

    async createManyClients(clientDataArray) {
      try {
        // Validate that the input is a non-empty array
        if (!Array.isArray(clientDataArray) || clientDataArray.length === 0) {
          throw new Error("Input must be a non-empty array of client data.");
        }
    
        const now = Date.now(); // Get the current time once for consistency across all leads
    
        //  add timestamps 
        const clientsToInsert = clientDataArray.map(clientDoc => ({
          ...clientDoc,          
          createdOn: now,      
          updatedOn: now,      
        }));
    
        
        const createdClients = await Client.insertMany(clientsToInsert, { ordered: false });
    
        consoleManager.log(`Successfully created ${createdClients.length} leads.`);
        return createdClients;
        
      } catch (err) {
        consoleManager.error(`Error creating clients in bulk: ${err.message}`);
        throw err; // Re-throw the error to be caught by the route handler
      }
    }

    async deleteAllClients() {
      try {
      const result = await Client.deleteMany({});
      consoleManager.log(`Deleted ${result.deletedCount} clients.`);
      return { deletedCount: result.deletedCount };
      } catch (err) {
      consoleManager.error(`Error deleting all clients: ${err.message}`);
      throw err;
      }
    }

}

export default new ClientService();