import Count from "../../models/count/countModel.js";
import Lead from "../../models/lead/leadModel.js";
import Client from "../../models/client/clientModal.js"; // Fixed typo in import
import Transaction from "../../models/transaction/transactionModel.js";
import User from "../../models/user/userModel.js";
import LinkClick from "../../models/linkclick/linkclickModel.js";
import AppLink from "../../models/applink/appLinkModel.js";
import Contact from "../../models/contact/contactModel.js";
import JoinLink from "../../models/joinlink/joinlinkModel.js";
import RestartDate from "../../models/restartdate/restartdateModel.js";
import Registration from "../../models/registeration/registerationModel.js";

class CountService {
  async createCount(data) {
    const count = new Count(data);
    await count.save();
    return count;   
  }

  async getAdminStats() {
    try {
      // Count documents for all models
      const leadsCount = await Lead.countDocuments();
      const clientsCount = await Client.countDocuments();
      const usersCount = await User.countDocuments();
      const linkClicksCount = await LinkClick.countDocuments();
      const appLinksCount = await AppLink.countDocuments();
      const contactsCount = await Contact.countDocuments();
      const joinLinksCount = await JoinLink.countDocuments();
      const restartDatesCount = await RestartDate.countDocuments();
      const registrationsCount = await Registration.countDocuments();
      
      // Get transactions data
      let transactionsCount = 0;
      let totalAmount = 0;
      
      try {
        transactionsCount = await Transaction.countDocuments();
        const transactions = await Transaction.find();
        totalAmount = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      } catch (err) {
        console.log("Transaction model may not exist:", err.message);
      }
      
      // User statistics
      const adminCount = await User.countDocuments({ role: "admin" });
      const regularUserCount = await User.countDocuments({ role: "user" });
      
      // Lead statistics by status
      const newLeadsCount = await Lead.countDocuments({ status: 'New' });
      const registeredLeadsCount = await Lead.countDocuments({ status: 'RegisterationDone' });
      const notInterestedLeadsCount = await Lead.countDocuments({ status: 'NotInterested' });
      
      // Client statistics
      const approvedClientsCount = await Client.countDocuments({ isApproved: true });
      const pendingClientsCount = await Client.countDocuments({ isApproved: false });
      
      return {
        // Total counts
        leads: leadsCount,
        clients: clientsCount,
        users: usersCount,
        linkClicks: linkClicksCount,
        appLinks: appLinksCount,
        contacts: contactsCount,
        joinLinks: joinLinksCount,
        restartDates: restartDatesCount,
        registrations: registrationsCount,
        transactions: transactionsCount,
        totalAmount,
        
        // Detailed statistics
        userStats: {
          admin: adminCount,
          regularUsers: regularUserCount
        },
        
        leadStats: {
          new: newLeadsCount,
          registered: registeredLeadsCount,
          notInterested: notInterestedLeadsCount
        },
        
        clientStats: {
          approved: approvedClientsCount,
          pending: pendingClientsCount
        }
      };
    } catch (error) {
      throw new Error(`Error getting admin stats: ${error.message}`);
    }
  }
}

export default new CountService();