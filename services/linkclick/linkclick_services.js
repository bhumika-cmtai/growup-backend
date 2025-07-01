import consoleManager from "../../utils/consoleManager.js";
import LinkClick from "../../models/linkclick/linkclickModel.js"

class LinkClickService {
  async createLinkClick(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      const existingLinkClick = await LinkClick.findOne({phoneNumber: data.phoneNumber})
      
      if (existingLinkClick) {
        const error = new Error("A linkClick with this phone Number already exists.");
        error.statusCode = 409; 
        throw error;
      }

      data.createdOn =  Date.now();

      const linkClick = new LinkClick(data);
      await linkClick.save();
      consoleManager.log("LinkClick created successfully");
      return linkClick;
    } catch (err) {
      consoleManager.error(`Error creating linkClick: ${err.message}`);
      throw err;
    }
  }


  async getLinkClickById(linkClickId) {
    try {
      const linkClick = await LinkClick.findById(linkClickId);
      if (!linkClick) {
        consoleManager.error("linkClick not found");
        return null;
      }
      return linkClick;
    } catch (err) {
      consoleManager.error(`Error fetching linkClick: ${err.message}`);
      throw err;
    }
  }

  async updateLinkClick(linkClickId, data) {
    try {
      data.updatedOn = Date.now();
      const linkClick = await LinkClick.findByIdAndUpdate(linkClickId, data, { new: true });
      if (!linkClick) {
        consoleManager.error("linkClick not found for update");
        return null;
      }
      consoleManager.log("linkClick updated successfully");
      return linkClick;
    } catch (err) {
      consoleManager.error(`Error updating linkClick: ${err.message}`);
      throw err;
    }
  }

  async deleteLinkClick(linkClickId) {
    try {
      const linkClick = await LinkClick.findByIdAndDelete(linkClickId);
      if (!linkClick) {
        consoleManager.error("linkClick not found for deletion");
        return null;
      }
      consoleManager.log("linkClick deleted successfully");
      return linkClick;
    } catch (err) {
      consoleManager.error(`Error deleting linkClick: ${err.message}`);
      throw err;
    }
  }

 async getAllLinkClicks(name='',phoneNumber = '', portalName = '',leaderCode='', status, page = 1, limit = 8) {
    try {
      const filterQuery = {};
      
      if (phoneNumber) {
        filterQuery.phoneNumber = { $regex: `^${phoneNumber}$`, $options: 'i' };
      }

      if (portalName) {
        filterQuery.portalName = portalName;
      }
      
      if (leaderCode) {
        filterQuery.leaderCode = leaderCode;
      }

      if (status) {
        filterQuery.status = status;
      }
      if (name) {
        // Use $regex for a "contains" search and $options: 'i' for case-insensitivity
        filterQuery.name = { $regex: name, $options: 'i' };
      }

      const linkClicks = await LinkClick.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      const totalLinkClicks = await LinkClick.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalLinkClicks / limit);
  
      return {
        linkClicks, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalLinkClicks
      };
    } catch (err) {
      consoleManager.error(`Error fetching linkClicks: ${err.message}`);
      throw err;
    }
  }
  
  async getAllPortalNames() {
    try {
      const portalNames = await LinkClick.distinct('portalName');
      consoleManager.log("Portal names retrieved successfully");
      // Filter out any null, undefined, or empty string values
      return portalNames.filter(name => name);
    } catch (err) {
      consoleManager.error(`Error fetching portal names: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfLinkClicks() {
    try {
      const count = await LinkClick.countDocuments();
      consoleManager.log(`Number of leads: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting linkClicks: ${err.message}`);
      throw err;
    }
  }

//   async getLinkClicksCountByDateRange(startDate, endDate) {
//     try {
//       const startTimestamp = new Date(startDate).setUTCHours(0, 0, 0, 0);

//       // To include the entire endDate, we get the start of the *next* day.
//       const endOfDay = new Date(endDate);
//       endOfDay.setUTCHours(23, 59, 59, 999);
//       const endTimestamp = endOfDay.getTime();

//       const filter = {
//         createdOn: {
//           $gte: String(startTimestamp), 
//           $lte: String(endTimestamp)   
//         }
//       };
      
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

//       const count = await LinkClick.countDocuments(filter);
//       consoleManager.log(`Found ${count} linkClicks created between ${startDate} and ${endDate}`);
//       return count;

//     } catch (err) {
//       consoleManager.error(`Error counting linkClicks by date range: ${err.message}`);
//       throw err;
//     }
//   }

}

export default new LinkClickService();