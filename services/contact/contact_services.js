import Contact from "../../models/contact/contactModel.js"
import consoleManager from "../../utils/consoleManager.js";

class ContactService {
  async createContact(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      data.createdOn =  Date.now();

      const contact = new Contact(data);
      await contact.save();
      consoleManager.log("Contact created successfully");
      return contact;
    } catch (err) {
      consoleManager.error(`Error creating contact: ${err.message}`);
      throw err;
    }
  }

  async getContactById(contactId) {
    try {
      const contact = await Contact.findById(contactId);
      if (!contact) {
        consoleManager.error("contact not found");
        return null;
      }
      return contact;
    } catch (err) {
      consoleManager.error(`Error fetching contact: ${err.message}`);
      throw err;
    }
  }

  async updateContact(contactId, data) {
    try {
      data.updatedOn = Date.now();
      const contact = await Contact.findByIdAndUpdate(contactId, data, { new: true });
      if (!contact) {
        consoleManager.error("contact not found for update");
        return null;
      }
      consoleManager.log("contact updated successfully");
      return contact;
    } catch (err) {
      consoleManager.error(`Error updating contact: ${err.message}`);
      throw err;
    }
  }

  async deleteContact(contactId) {
    try {
      const contact = await Contact.findByIdAndDelete(contactId);
      if (!contact) {
        consoleManager.error("contact not found for deletion");
        return null;
      }
      consoleManager.log("contact deleted successfully");
      return contact;
    } catch (err) {
      consoleManager.error(`Error deleting contact: ${err.message}`);
      throw err;
    }
  }

  async getAllContacts(query = {}, page = 1, limit = 20) {
    try {
      // Build the query object for filtering
      const filterQuery = {};
      if (query.name) {
        filterQuery.name = { $regex: query.name, $options: 'i' }; 
      }
      if (query.email) {
        filterQuery.email = { $regex: query.email, $options: 'i' };
      }
  
      // Fetch contacts with pagination
      const contacts = await Contact.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of Contact for pagination
      const totalContacts = await Contact.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalContacts / limit);
  
      return {
        contacts, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalContacts
      };
    } catch (err) {
      consoleManager.error(`Error fetching contacts: ${err.message}`);
      throw err;
    }
  }
  

//   async toggleLeadStatus(leadId) {
//     try {
//       const lead = await Lead.findById(leadId);
//       if (!lead) {
//         consoleManager.error("Lead not found for status toggle");
//         return null;
//       }

//       // Toggle the status between 'active' and 'inactive'
//       const newStatus = lead.status === "Active" ? "Inactive" : "Active";
//       const updatedLead = await Lead.findByIdAndUpdate(
//         leadId,
//         { status: newStatus, updatedOn: Date.now() },
//         { new: true }
//       );

//       consoleManager.log(`Lead status updated to ${newStatus}`);
//       return updatedLead;
//     } catch (err) {
//       consoleManager.error(`Error toggling lead status: ${err.message}`);
//       throw err;
//     }
//   }

  async getNumberOfContacts() {
    try {
      const count = await Contact.countDocuments();
      consoleManager.log(`Number of leads: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting contacts: ${err.message}`);
      throw err;
    }
  }
}

export default new ContactService();