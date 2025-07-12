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
                consoleManager.log(`No appLink found with ID to update: ${id}`);
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
            const allLinks = await AppLink.find({}).lean();
            const applink = allLinks.find(link =>
              link.appName.trim().toLowerCase() === appName.trim().toLowerCase() &&
              link.password.trim() === password.trim()
            );
            if (!applink) {
              return null;
            }
            return {link: applink.link};
        } catch (err) {
            throw err;
        }
    }
}

export default new AppLinkService();