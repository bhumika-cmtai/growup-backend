import User from "../../models/user/userModel.js"
import  jwt  from "jsonwebtoken";
import AppLink from "../../models/applink/appLinkModel.js";
// import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
import AppLinkService from "../../services/applink/applink_service.js"



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
        consoleManager.log(`Login attempt failed for email: ${email}. User not found or incorrect site password provided.`);
        throw new Error(`Invalid credentials`);
      }

      // If all checks pass, proceed with generating the token for the found user.
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d',
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
      // console.log(user)
      if (!user) {
        consoleManager.error(`Login attempt failed: Non-admin user not found for email: ${email}`);
        throw new Error("Invalid credentials");
      }
 if (user.role === 'admin') {
      // --- ADMIN LOGIC ---
      // This is the original logic. Check password against the user's document.
      consoleManager.log(`Admin login attempt for: ${email}`);

      // --- SECURITY WARNING ---
      // This is a plain-text password comparison. In a real application,
      // you MUST hash passwords using a library like bcrypt.
      if (user.password !== password) {
        consoleManager.error(`Login attempt failed: Invalid password for admin user: ${email}`);
        throw new Error("Invalid credentials");
      }
      consoleManager.log(`Admin password verified successfully for: ${email}`);

    } else {
      // --- NON-ADMIN LOGIC ---
      // For any other role, check the provided password against the 'site' app link password.
      consoleManager.log(`Non-admin login attempt for: ${email}. Verifying against 'site' app password.`);
      console.log(`Non-admin login attempt for: ${email}. Verifying against 'site' app password.`)

      // Call the service from applink_service.js
      // We pass 'site' as the appName and the password from the login form.
      const appLinkData = await AppLinkService.getLinkByCredentials('site', password)
      // console.log(appLinkData.link)
      // If getLinkByCredentials returns null, the password was incorrect.
      if (!appLinkData) {
        consoleManager.error(`Login attempt failed: Invalid 'site' password provided for non-admin user: ${email}`);
        throw new Error("Invalid credentials");
      }
      consoleManager.log(`Non-admin 'site' password verified successfully for: ${email}`);
    }

    // Step 3: COMMON SUCCESS LOGIC (runs if no error was thrown above)
    // If we reach this point, authentication was successful for either admin or non-admin.

    // Create JWT payload and token
    const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d',
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
  
}

export default new LoginService();