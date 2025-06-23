import consoleManager from "../../utils/consoleManager.js";
import Client from "../../models/client/clientModal.js";

class ClientService {
  async createClient(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      const existingClient = await Client.findOne({email: data.email})
      
      if (existingClient) {
        const error = new Error("A client with this email already exists.");
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

  async getAllClients(searchQuery = '',status, page = 1, limit = 8) {
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
      // Fetch clients with pagination
      const clients = await Client.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of Client for pagination
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

  



}

export default new ClientService();