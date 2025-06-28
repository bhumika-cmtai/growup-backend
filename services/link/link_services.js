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
            consoleManager.error(`Error creating link: ${err.message}`)
            throw err
        }
    }
    async getLinkByPortalName(portalName) {
    try {
      const result = await Link.findOne({ portalName: portalName }).select('link -_id').lean();
      
      if (result) {
        consoleManager.log(`Successfully found link for portal: ${portalName}`);
      } else {
        consoleManager.warn(`No link found for portal: ${portalName}`);
      }
      
      return result;
    } catch (err) {
      consoleManager.error(`Error fetching link for portal ${portalName}: ${err.message}`);
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
        consoleManager.warn(`No link found with ID to update: ${id}`);
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

  async getAllLinks() {
        try {
          // Find all documents, sort them by portalName alphabetically
          // .lean() is a performance optimization for read-only queries
          console.log("hello")
          const links = await Link.find({}).lean();
          console.log(links)
          
          consoleManager.log("Successfully fetched all links.");
          return links;
        } catch (err) {
          consoleManager.error(`Error fetching all links: ${err.message}`);
          throw err;
        }
    }

}

export default new LinkService()