// import RestartDate from '../models/restart_date.model.js'; // Adjust the path as needed
import RestartDate from '../../models/restartdate/restartdateModel.js';
// import consoleManager from '../utils/consoleManager.js';   // Adjust the path as needed
import consoleManager from '../../utils/consoleManager.js';

// Using a constant for the identifier to avoid magic strings and ensure consistency.
const IDENTIFIER = 'GLOBAL_RESTART_DATE';

class RestartDateService {

  async getRestartDate() {
    try {
      const setting = await RestartDate.findOne({ identifier: IDENTIFIER });

      if (!setting) {
        // This is an expected state if the date has never been set, not an error.
        consoleManager.log("Restart date has not been set yet.");
        return null;
      }
      
      consoleManager.log("Restart date retrieved successfully.");
      return setting;

    } catch (err) {
      consoleManager.error(`Error fetching restart date: ${err.message}`);
      throw err; // Re-throw the error for the route handler to catch
    }
  }

  async setRestartDate(dateValue) {
    try {
      const query = { identifier: IDENTIFIER };
      const update = { restartDate: dateValue };
      const options = {
        upsert: true, // Create the document if it doesn't exist
        new: true,    // Return the modified document instead of the original
        setDefaultsOnInsert: true, // Apply schema defaults on creation
      };

      const updatedSetting = await RestartDate.findOneAndUpdate(query, update, options);

      consoleManager.log("Restart date was set/updated successfully.");
      return updatedSetting;

    } catch (err) {
      consoleManager.error(`Error setting restart date: ${err.message}`);
      throw err; // Re-throw the error for the route handler to catch
    }
  }
}

export default new RestartDateService();