import User from "../../models/user/userModel.js"
import consoleManager from "../../utils/consoleManager.js";
// const User = require("../../models/user/userModel");
// const consoleManager = require("../../utils/consoleManager");

class UserService {
  async createUser(data) {
   try {
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 409; 
        throw error;
      }
      data.createdOn =  Date.now();
      data.updatedOn =  Date.now();

      const user = new User(data);
      await user.save();
      consoleManager.log("User created successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error creating user: ${err.message}`);
      throw err;
    }
  }
  async createManyUsers(usersDataArray) {
  try {
    // Validate that the input is a non-empty array
    if (!Array.isArray(usersDataArray) || usersDataArray.length === 0) {
      throw new Error("Input must be a non-empty array of user data.");
    }

    const now = Date.now(); // Get the current time once for consistency across all users

    //  add timestamps 
    const usersToInsert = usersDataArray.map(userDoc => ({
      ...userDoc,          
      createdOn: now,      
      updatedOn: now,      
    }));

    
    const createdUsers = await User.insertMany(usersToInsert, { ordered: false });

    consoleManager.log(`Successfully created ${createdUsers.length} users.`);
    return createdUsers;
    
  } catch (err) {
    consoleManager.error(`Error creating users in bulk: ${err.message}`);
    throw err; // Re-throw the error to be caught by the route handler
  }
}

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error("User not found");
        return null;
      }
      return user;
    } catch (err) {
      consoleManager.error(`Error fetching user: ${err.message}`);
      throw err;
    }
  }

  async updateUser(userId, data) {
    try {
      data.updatedOn = Date.now();
      const user = await User.findByIdAndUpdate(userId, data, { new: true });
      console.log(user)
      if (!user) {
        consoleManager.error("User not found for update");
        return null;
      }
      consoleManager.log("User updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user: ${err.message}`);
      throw err;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        consoleManager.error("User not found for deletion");
        return null;
      }
      consoleManager.log("User deleted successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error deleting user: ${err.message}`);
      throw err;
    }
  }

  async deleteManyUsers(userIds) {
    try {
      const result = await User.deleteMany({ _id: { $in: userIds } });
      consoleManager.log(`Deleted ${result.deletedCount} users.`);
      return result;
    } catch (err) { 
      consoleManager.error(`Error deleting users: ${err.message}`);
      throw err;
    }
  } 

  async getAllUsers(searchQuery = '', status, page = 1, limit = 8) {
  try {
    const pageNum = parseInt(page , 10);
    const limitNum = parseInt(limit , 10);

    // 1. Build the initial matching stage (no changes here)
    const matchStage= {};
    if (searchQuery) {
      const regex = { $regex: searchQuery, $options: 'i' };
      matchStage.$or = [{ name: regex }, { email: regex }];
    }
    if (status) {
      matchStage.status = status;
    }

    // 2. Main Aggregation Pipeline to get users
    // --- MODIFICATION: The pipeline is now built conditionally ---
    const usersPipeline = [
      // Stage 1: Filter users based on search and status
      { $match: matchStage },
      
      // Stage 2: Perform a "left join" to the 'clients' collection
      {
        $lookup: {
          from: "registerations",
          localField: "leaderCode",
          foreignField: "leaderCode",
          as: "registeredClients"
        }
      },

      // Stage 3: Add the new 'registeredClientCount' field
      {
        $addFields: {
          registeredClientCount: { $size: "$registeredClients" }
        }
      },

      // Stage 4: Clean up the response
      {
        $project: {
          registeredClients: 0,
          password: 0
        }
      },
      
      // Stage 5: Sort results
      { $sort: { createdOn: -1 } },
    ];
    
    // --- MODIFICATION: Conditionally apply pagination ---
    // We check if the requested limit is a "normal" number for pagination.
    // If it's a large number like 10000, we skip these stages to return all documents.
    const APPLY_PAGINATION_THRESHOLD = 1000; 
    if (limitNum < APPLY_PAGINATION_THRESHOLD) {
      const skip = (pageNum - 1) * limitNum;
      usersPipeline.push(
        { $skip: skip },
        { $limit: limitNum }
      );
    }
    
    // 3. Separate Aggregation to get the total count for pagination (no changes here)
    // This pipeline is essential for the frontend to know the total number of records.
    const countPipeline = [
        { $match: matchStage },
        { $count: 'totalUsers' }
    ];

    // 4. Execute both pipelines (no changes here)
    const [users, totalCountResult] = await Promise.all([
        User.aggregate(usersPipeline),
        User.aggregate(countPipeline)
    ]);
    
    const totalUsers = totalCountResult.length > 0 ? totalCountResult[0].totalUsers : 0;
    
    // The totalPages calculation will correctly result in 1 if pagination is not applied.
    const totalPages = Math.ceil(totalUsers / limitNum);

    return {
      users,
      totalPages,
      currentPage: pageNum,
      totalUsers
    };

  } catch (err) {
    console.error(`Error fetching users with client count: ${err.message}`);
    throw err;
  }
}
  

  async toggleUserStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error("User not found for status toggle");
        return null;
      }

      // Toggle the status between 'active' and 'inactive'
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`User status updated to ${newStatus}`);
      return updatedUser;
    } catch (err) {
      consoleManager.error(`Error toggling user status: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfUsers() {
    try {
      const count = await User.countDocuments();
      consoleManager.log(`Number of users: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting users: ${err.message}`);
      throw err;
    }
  }
  async getLeaderCode(leaderCode){
    try{
      const user = await User.findOne(
        { leaderCode: leaderCode },
        'name leaderCode -_id' 
      );
     if (!user) {
        consoleManager.error("Leader Code not found");
        return null;
      }
      return user;
    } catch (err) {
      consoleManager.error(`Error fetching Leader Code from user: ${err.message}`);
      throw err;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const updateFields = {
        name: profileData.name,
        whatsappNumber: profileData.whatsappNumber,
        city: profileData.city,
        bio: profileData.bio,
        updatedOn: Date.now(),
        password: profileData.password
      };

      // Remove any fields that were not provided in the request body
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      if (!user) {
        consoleManager.error("User not found for profile update");
        return null;
      }
      
      consoleManager.log("User profile updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user profile: ${err.message}`);
      throw err;
    }
  }

  // =================================================================
  // NEW FUNCTION FOR UPDATING BANK DETAILS
  // =================================================================
  async updateBankDetails(userId, bankData) {
    try {
      const updateFields = {
        account_number: bankData.account_number,
        Ifsc: bankData.Ifsc,
        upi_id: bankData.upi_id,
        updatedOn: Date.now()
      };

      // Remove any fields that were not provided in the request body
      Object.keys(updateFields).forEach(key => {
         if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
      if (!user) {
        consoleManager.error("User not found for bank details update");
        return null;
      }
      
      consoleManager.log("User bank details updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating bank details: ${err.message}`);
      throw err;
    }
  }

    async getNumberOfUsers() {
      try {
        const count = await User.countDocuments();
        consoleManager.log(`Number of users: ${count}`);
        return count;
      } catch (err) {
        consoleManager.error(`Error counting users: ${err.message}`);
        throw err;
      }
    }

    async updateIncomesForMultipleUsers(phoneNumbers, amountToAdd) {
        try {
            // Use $inc to atomically increment the income field for all matching users
            const result = await User.updateMany(
                { phoneNumber: { $in: phoneNumbers } }, // Filter: find users whose phone number is in the array
                { $inc: { income: amountToAdd } }      // Update: increment the income field by the specified amount
            );

            consoleManager.log(`Successfully updated income for ${result.modifiedCount} users.`);
            return result;
        } catch (err) {
            consoleManager.error(`Error updating incomes for multiple users: ${err.message}`);
            throw err; // Re-throw the error to be handled by the calling service
        }
    }

    async getTotalIncome() {
      try {
        const result = await User.aggregate([
          { $group: { _id: null, totalIncome: { $sum: "$income" } } }
        ]);
        const totalIncome = result.length > 0 ? result[0].totalIncome : 0;
        consoleManager.log(`Total income of all users: ${totalIncome}`);
        return totalIncome;
      } catch (err) {
        consoleManager.error(`Error calculating total income: ${err.message}`);
        throw err;
      }
    }


    async clearAllIncome() {
      try {
      const result = await User.updateMany(
        {},
        { $set: { income: 0 } }
      );
      consoleManager.log(`Cleared income for ${result.modifiedCount} users.`);
      return result;
      } catch (err) {
      consoleManager.error(`Error clearing income fields: ${err.message}`);
      throw err;
      }
    }

}




export default new UserService();