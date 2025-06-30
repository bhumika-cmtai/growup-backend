import User from "../../models/user/userModel.js"
import  jwt  from "jsonwebtoken";
import AppLink from "../../models/applink/appLinkModel.js";
// import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";


class LoginService {
  async loginRegularUser(email, password) {
    try {
      // Perform two database lookups concurrently for efficiency:
      // 1. Find the user by their email.
      // 2. Find the global 'site' password from the AppLink collection.
      const [user, siteAppLink] = await Promise.all([
        User.findOne({ email: email}),
        AppLink.findOne({ appName: 'site' }) // .lean() for a fast, read-only object
      ]);
      // const user = await User.findOne({email: email, })
      // console.log(user)
      // console.log(siteAppLink)
      // CRITICAL: Check if the 'site' AppLink is configured in your database.
      // If it's missing, no one can log in. This is a server configuration error.
      // if (!siteAppLink) {
      //   consoleManager.error("FATAL: 'site' AppLink is not configured in the database. User login is disabled.");
      //   throw new Error("Login service configuration error.");
      // }

      // Now, validate the user and the provided password against the site password.
      // Use a generic error for security reasons.
      if (!user || password !== siteAppLink.password) {
        consoleManager.warn(`Login attempt failed for email: ${email}. User not found or incorrect site password provided.`);
        throw new Error(`Invalid credentials`);
      }

      // If all checks pass, proceed with generating the token for the found user.
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      });

      const userResponse = user.toObject();
      delete userResponse.password; // Remove the user's own password, if they have one

      consoleManager.log(`User '${user.email}' logged in successfully using site-wide credentials.`);
      return { user: userResponse, token };

    } catch (err) {
      // Re-throw the error to be handled by the route
      throw err;
    }
  }


  async loginUser(email, password) {
    try {
      // Find a user who is NOT an admin by their email
      const user = await User.findOne({ email: email});
      console.log(user)
      if (!user) {
        consoleManager.error(`Login attempt failed: Non-admin user not found for email: ${email}`);
        throw new Error("Invalid credentials");
      }

      // --- SECURITY WARNING ---
      // This is a plain-text password comparison. In a real application,
      // you MUST hash passwords using a library like bcrypt.
      // The comparison would then be:
      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) { ... }
      // ------------------------
      if (user.password !== password) {
        consoleManager.error(`Login attempt failed: Invalid password for user: ${email}`);
        throw new Error("Invalid credentials");
      }

      // Create JWT payload and token
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      });

      // Prepare a safe user object to return (without the password)
      const userResponse = user.toObject();
      delete userResponse.password;

      consoleManager.log(`User '${user.email}' logged in successfully.`);
      return { user: userResponse, token };
    } catch (err) {
      // Re-throw the error to be handled by the route
      throw err;
    }
  }

   async loginAdmin(email, password) {
    try {
      // Find a user who IS an admin by their name
      const adminUser = await User.findOne({ email: email, role: 'admin' });

      if (!adminUser) {
        consoleManager.error(`Admin login failed: Admin with name '${email}' not found.`);
        throw new Error("Invalid credentials");
      }

      // Same security warning about plain-text passwords applies here.
      if (adminUser.password !== password) {
        consoleManager.error(`Admin login failed: Invalid password for admin '${email}'.`);
        throw new Error("Invalid credentials");
      }

      // Create JWT payload and token
      const payload = { id: adminUser._id, role: adminUser.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

      // Prepare a safe user object to return
      const userResponse = adminUser.toObject();
      delete userResponse.password;

      consoleManager.log(`Admin '${adminUser.name}' logged in successfully.`);
      return { user: userResponse, token };
    } catch (err) {
      // Re-throw the error
      throw err;
    }
  }


  async loginPortal(password){
    try{

      const siteAppLink = await AppLink.findOne({ appName: 'site' })

      if (password !== siteAppLink.password) {
        consoleManager.warn(`Login attempt failed incorrect site password provided.`);
        throw new Error(`Invalid credentials`);
      }

      return {
        link: siteAppLink.link,
        appName: siteAppLink.appName
      };

    } catch (err) {
      // Re-throw the error to be handled by the route
      throw err;
    }
  }
  
}

export default new LoginService();