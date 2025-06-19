import express from "express"
import UserService from "../../services/user/user_services.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
// const express = require('express');

// const UserService = require('../../services/user/user_services');
// const ResponseManager = require('../../utils/responseManager');
// const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new user
router.post('/addUser', async (req, res) => {
    try {
      // Extract fields from the request body
      if (!req.body.name) {
        return ResponseManager.handleBadRequestError(res, 'Name is required');
      }
  
      if (!req.body.email) {
        return ResponseManager.handleBadRequestError(res, 'Email is required');
      }
      
      if (!req.body.password) {
        return ResponseManager.handleBadRequestError(res, 'Password is required');
      }
  
      if (!req.body.phoneNumber) {
        return ResponseManager.handleBadRequestError(res, 'Primary phone is required');
      }
  
      if (!req.body.role) {
        return ResponseManager.handleBadRequestError(res, 'Role is required');
      }
  
      // Create the user if all required fields are present
      const user = await UserService.createUser(req.body);
      return ResponseManager.sendSuccess(res, user, 201, 'User created successfully');
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating user');
    }
  });

//Create many users 
router.post('/addManyUser', async (req,res)=>{
    try {
    const usersArray = req.body;

    if (!Array.isArray(usersArray) || usersArray.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'Request body must be a non-empty array of user objects.');
    }

    const createdUsers = await UserService.createManyUsers(usersArray);

    const successMessage = `Successfully processed request. Created ${createdUsers.length} of ${usersArray.length} users.`;
    return ResponseManager.sendSuccess(res, createdUsers, 201, successMessage);

  } catch (err) {
    consoleManager.error(`Error in /addManyUsers route: ${err.message}`);
    console.log(`Error in /addManyUsers route: ${err.message}`)
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred during the bulk creation process.');
  }
})


// Get a user by ID
router.get('/getUser/:id', async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (user) {
      ResponseManager.sendSuccess(res, user, 200, 'User retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'User not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching user');
  }
});

// Update a user by ID
router.put('/updateUser/:id', async (req, res) => {
    try {
      // Update the user if all required fields are present
      const user = await UserService.updateUser(req.params.id, req.body);
      console.log(user)
      if (user) {
        return ResponseManager.sendSuccess(res, user, 200, 'User updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'User not found for update');
      }
    } catch (err) {
      console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating user');
    }
  });

// Delete a user by ID
router.delete('/deleteUser/:id', async (req, res) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (user) {
      ResponseManager.sendSuccess(res, user, 200, 'User deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'User not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting user');
  }
});

// Get all users
router.get('/getAllUsers', async (req, res) => {
  try {
   const { searchQuery, page = 1, limit = 20 } = req.query;

    const result = await UserService.getAllUsers(searchQuery, page, limit);

    if(result.length==0 || !result){
      return ResponseManager.sendSuccess(res, [], 200, 'No users found');
    }

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res, 
      {
        users: result.users,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalUsers: result.totalUsers
      }, 
      200, 
      'Users retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching users: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching users'
    );
  }
});


// Toggle user status
// router.put('/removeUser/:id', async (req, res) => {
//   try {
//     const user = await UserService.toggleUserStatus(req.params.id);
//     if (user) {
//       ResponseManager.sendSuccess(res, user, 200, 'User status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'User not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling user status');
//   }
// });

export default router;