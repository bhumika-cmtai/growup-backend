import consoleManager from "../../utils/consoleManager.js";
import Client from "../../models/client/clientModal.js";

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

 async getAllClients(name='',phoneNumber = '', portalName = '', status, page = 1, limit = 8) {
    try {
      const filterQuery = {};
      
      if (phoneNumber) {
        filterQuery.phoneNumber = { $regex: `^${phoneNumber}$`, $options: 'i' };
      }

      if (portalName) {
        filterQuery.portalName = portalName;
      }
  
      if (status) {
        filterQuery.status = status;
      }
      if(name){
        filterQuery.name = name;
      }

      const clients = await Client.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      const totalClients = await Client.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalClients / limit);
  
      return {
        clients, 
        totalPages, 
        currentPage: parseInt(page, 10), 
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



}

export default new ClientService();