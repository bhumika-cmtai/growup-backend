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

  async getAllUsers(searchQuery = '', status, page = 1, limit = 8) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // 1. Build the initial matching stage (same as your old filterQuery)
      const matchStage = {};
      if (searchQuery) {
        const regex = { $regex: searchQuery, $options: 'i' };
        matchStage.$or = [
          { name: regex },
          { email: regex }
        ];
      }
      if (status) {
        matchStage.status = status;
      }

      // 2. Main Aggregation Pipeline to get users with client count
      const usersPipeline = [
        // Stage 1: Filter users based on search and status
        { $match: matchStage },
        
        // Stage 2: Perform a "left join" to the 'clients' collection
        // It connects User.leaderCode with Client.leaderCode
        {
          $lookup: {
            from: "clients", // The collection name in MongoDB (Mongoose pluralizes it)
            localField: "leaderCode", // Field from the User collection
            foreignField: "leaderCode", // Field from the Client collection
            as: "registeredClients" // The name of the new array field to add
          }
        },

        // Stage 3: Add the new 'registeredClientCount' field
        // We calculate the size of the 'registeredClients' array from the $lookup
        {
          $addFields: {
            registeredClientCount: { $size: "$registeredClients" }
          }
        },

        // Stage 4: Clean up the response
        // Remove the temporary 'registeredClients' array and the sensitive password field
        {
          $project: {
            registeredClients: 0, // Exclude the full client list
            password: 0 // CRITICAL: Never send the password
          }
        },
        
        // Stage 5: Sort results (optional, but good for consistency)
        { $sort: { createdOn: -1 } },

        // Stage 6: Apply pagination
        { $skip: skip },
        { $limit: limitNum }
      ];
      
      // 3. Separate Aggregation to get the total count for pagination
      const countPipeline = [
          { $match: matchStage },
          { $count: 'totalUsers' }
      ];

      // 4. Execute both pipelines
      const [users, totalCountResult] = await Promise.all([
          User.aggregate(usersPipeline),
          User.aggregate(countPipeline)
      ]);
      
      const totalUsers = totalCountResult.length > 0 ? totalCountResult[0].totalUsers : 0;
      const totalPages = Math.ceil(totalUsers / limitNum);

      return {
        users,
        totalPages,
        currentPage: pageNum,
        totalUsers
      };

    } catch (err) {
      consoleManager.error(`Error fetching users with client count: ${err.message}`);
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


}




export default new UserService();