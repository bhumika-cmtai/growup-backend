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

  async getAllUsers(searchQuery = '', status , page = 1, limit = 8) {
  try {
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
  
      // Fetch users with pagination
      const users = await User.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of users for pagination
      const totalUsers = await User.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalUsers / limit);
  
      return {
        users, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalUsers
      };
    } catch (err) {
      consoleManager.error(`Error fetching users: ${err.message}`);
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
  async getTlCode(tlcode){
    try{
      const user = await User.findOne({ tlcode: tlcode });
     if (!user) {
        consoleManager.error("tlcode not found");
        return null;
      }
      return user;
    } catch (err) {
      consoleManager.error(`Error fetching tlcode from user: ${err.message}`);
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


}




export default new UserService();