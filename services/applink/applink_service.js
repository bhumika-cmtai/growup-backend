import AppLink from "../../models/applink/appLinkModel.js";
import consoleManager from "../../utils/consoleManager.js"; 

class AppLinkService {
// // ADMIN -> CREATE PORTAL
//     async createPortal(data) {
//         try {
//             const portal = new AppLink(data);
//             await portal.save();
//             consoleManager.log("AppLink Created successfully");
//             const portalObj = portal.toObject();
//             return portalObj;
//         } catch (err) {
//             consoleManager.error(`Error creating AppLink: ${err.message}`);
//             throw err;
//         }
//     }
// ADMIN -> GET ALL APPLINKS
    async getAllAppLinks() {
        try {
            const applink = await AppLink.find({}).lean();
            consoleManager.log("Successfully fetched all AppLink");
            return applink;
        } catch (err) {
            consoleManager.error(`Error fetching all AppLink: ${err.message}`);
            throw err;
        }
    }
// ADMIN -> UPDATE APPLINK DETAILS
    async updateAppLinkById(id, updateData) {
        try {

            const updatedAppLink = await AppLink.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            }) 

            if (updatedAppLink) {
                consoleManager.log(`Successfully updated appLink with ID: ${id}`);
            } else {
                consoleManager.warn(`No appLink found with ID to update: ${id}`);
            }
            return updatedAppLink;
        } catch (err) {
            consoleManager.error(`Error updating appLink with ID ${id}: ${err.message}`);
            throw err;
        }
    }
// GET LINK BY PASSWORD
    async getLinkByCredentials(appName, password) {
        try {
            // Directly appName aur password ko database me match karein
            const applink = await AppLink.findOne({ 
              appName: appName, 
              password: password  // Plain text password comparison
            });

            // Agar applink nahi mila, to credentials galat hain
            if (!applink) {
                consoleManager.warn(`Invalid credentials for appName: ${appName}`);
                return null;
            }

            consoleManager.log(`Successfully authenticated and found link for: ${appName}`);
            // Sirf link return karein
            return { link: applink.link };
        } catch (err) {
            consoleManager.error(`Error authenticating applink ${appName}: ${err.message}`);
            throw err;
        }
    }
}

export default new AppLinkService();