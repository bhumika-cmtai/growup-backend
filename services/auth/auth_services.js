import User from "../../models/user/userModel.js"
import  jwt  from "jsonwebtoken";
// import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";


class LoginService {
  async loginUser(email, password) {
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        consoleManager.error("User not found");
        throw new Error("User not found");
      }

      // Compare the provided password with the stored password
      if (user.password !== password) {
        consoleManager.error("Invalid password");
        throw new Error("Invalid password");
      }
      const payload = {id: user._id}
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const userResponse = {name: user.name, email: user.email, role: user.role} 

      consoleManager.log("User logged in successfully");
      console.log({userResponse, token})
      return token; // Return only the token
    } catch (err) {
      consoleManager.error(`Error logging in user: ${err.message}`);
      throw err;
    }
  }
}

export default new LoginService();