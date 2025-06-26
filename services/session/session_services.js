// services/session/SessionService.js
import GlobalSession from "../../models/session/sessionModal.js";
import consoleManager from "../../utils/consoleManager.js";

// The fixed identifier for our single session document
const SESSION_IDENTIFIER = { name: 'global_session_schedule' };

class SessionService {
  /**
   * Retrieves the global session document.
   */
  async getGlobalSession() {
    try {
      const session = await GlobalSession.findOne(SESSION_IDENTIFIER);
      if (!session) {
        consoleManager.log("Global session not found. It will be created on the first update.");
        return null;
      }
      consoleManager.log("Global session retrieved successfully.");
      return session;
    } catch (err) {
      consoleManager.error(`Error fetching global session: ${err.message}`);
      throw err;
    }
  }

  /**
   * Updates the global session document. If it doesn't exist, it creates it.
   * @param {object} data - An object containing session fields to update.
   */
  async updateGlobalSession(data) {
    try {
      // Use findOneAndUpdate with `upsert: true` to always target the single document.
      const updatedSession = await GlobalSession.findOneAndUpdate(
        SESSION_IDENTIFIER,
        { $set: data },
        { 
          new: true,           // Return the modified document
          upsert: true,        // Create the document if it doesn't exist
          runValidators: true, // Run schema validations
        }
      );
      
      consoleManager.log("Global session updated successfully.");
      return updatedSession;
    } catch (err) {
      consoleManager.error(`Error updating global session: ${err.message}`);
      throw err;
    }
  }
}

export default new SessionService();