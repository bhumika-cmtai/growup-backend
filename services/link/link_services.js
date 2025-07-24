import Link from '../../models/link/linkModel.js'
import consoleManager from "../../utils/consoleManager.js";

class LinkService {
    async createLink(data){
        try{
            data.createdOn = Date.now();
            data.updatedOn = Date.now();

            const link = new Link(data)
            await link.save()
            consoleManager.log("Link Created successfully")
            return link
        }
        catch(error){
            consoleManager.error(`Error creating link: ${error.message}`)
            throw error
        }
    }
    
    async getLinkByPortalName(portalName) {
      try {
        // Use regex for partial and case-insensitive match
        const regex = new RegExp(portalName, 'i');
        const result = await Link.findOne({ portalName: { $regex: regex } }).select('link -_id').lean();
        
        if (result) {
          consoleManager.log(`Successfully found link for portal (partial/regex match): ${portalName}`);
        } else {
          consoleManager.log(`No link found for portal (partial/regex match): ${portalName}`);
        }
        
        return result;
      } catch (err) {
        consoleManager.error(`Error fetching link for portal ${portalName} (partial/regex match): ${err.message}`);
        throw err;
      }
    }

  async updateLinkById(id, updateData) {
    try {
      
      const updatedLink = await Link.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      });

      if (updatedLink) {
        consoleManager.log(`Successfully updated link with ID: ${id}`);
      } else {
        consoleManager.log(`No link found with ID to update: ${id}`);
      }

      return updatedLink; 
    } catch (err) {
      // Check for a duplicate key error (if portalName is already taken)
      if (err.code === 11000) {
        consoleManager.error(`Update failed: portalName '${updateData.portalName}' already exists.`);
        // Create a more specific error to be handled by the route
        const customError = new Error(`The portal name '${updateData.portalName}' is already in use.`);
        customError.statusCode = 409; 
        throw customError;
      }
      consoleManager.error(`Error updating link with ID ${id}: ${err.message}`);
      throw err;
    }
  }

  async deleteLinkById(id) {
    try {
      const deletedLink = await Link.findByIdAndDelete(id);
      if (deletedLink) {
        consoleManager.log(`Successfully deleted link with ID: ${id}`);
      } else {
        consoleManager.log(`No link found with ID to delete: ${id}`);
      }
      return deletedLink;
    } catch (err) {
      consoleManager.error(`Error deleting link with ID ${id}: ${err.message}`);
      throw err;
    }
  }

  async getCommissionByPortalName(portalName) {
    try {
      // Use regex for case-insensitive match
      const regex = new RegExp(portalName, 'i');
      const result = await Link.findOne({ portalName: { $regex: regex } }).select('commission -_id').lean();
      
      if (result) {
        consoleManager.log(`Successfully found commission for portal: ${portalName}`);
      } else {
        consoleManager.log(`No commission found for portal: ${portalName}`);
      }
      
      return result;
    } catch (err) {
      consoleManager.error(`Error fetching commission for portal ${portalName}: ${err.message}`);
      throw err;
    }
  }


  async getAllLinks() {
        try {
          // Find all documents, sort them by portalName alphabetically
          // .lean() is a performance optimization for read-only queries
          // console.log("hello")
          const links = await Link.find({}).lean();
          // console.log(links)
          
          consoleManager.log("Successfully fetched all links.");
          return links;
        } catch (err) {
          consoleManager.error(`Error fetching all links: ${err.message}`);
          throw err;
        }
    }

}

export default new LinkService()