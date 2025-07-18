import Joinlink from "../../models/joinlink/joinlinkModel.js";
import consoleManager from "../../utils/consoleManager.js"; 

class JoinlinkService {

// ADMIN -> GET ALL JOINLINKS
    async getAllJoinlinks() {
        try {
            const applink = await Joinlink.find({}).lean();
            consoleManager.log("Successfully fetched all Joinlink");
            return applink;
        } catch (err) {
            consoleManager.error(`Error fetching all Joinlink: ${err.message}`);
            throw err;
        }
    }
// ADMIN -> UPDATE JOINLINK DETAILS
    async updateJoinlinkById(id, updateData) {
        try {

            const updatedJoinlink = await Joinlink.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            }) 

            if (updatedJoinlink) {
                consoleManager.log(`Successfully updated joinlink with ID: ${id}`);
            } else {
                consoleManager.log(`No joinlink found with ID to update: ${id}`);
            }
            return updatedJoinlink;
        } catch (err) {
            consoleManager.error(`Error updating joinlink with ID ${id}: ${err.message}`);
            throw err;
        }
    }
// GET LINK BY PASSWORD
    async getLinkByAppName(appName) {
        try {
            // Directly appName aur password ko database me match karein
            const applink = await Joinlink.findOne({ 
              appName: appName, 
            });

            // Agar applink nahi mila, to credentials galat hain
            if (!applink) {
                consoleManager.log(`Invalid appName: ${appName}`);
                return null;
            }

            consoleManager.log(`Successfully found link for: ${appName}`);
            // Sirf link return karein
            return { link: applink.link };
        } catch (err) {
            consoleManager.error(`Error applink ${appName}: ${err.message}`);
            throw err;
        }
    }
}

export default new JoinlinkService();