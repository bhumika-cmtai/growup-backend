import mongoose from "mongoose";
const restartDateSchema = new mongoose.Schema({
  restartDate: {
    type: Date,
    required: true,
  },
  // This identifier ensures we can always find the single, global setting.
  // The unique index enforces that only one document with this value can exist.
  identifier: {
    type: String,
    required: true,
    unique: true,
    default: 'GLOBAL_RESTART_DATE',
  },
}, {
  // Automatically adds createdAt and updatedAt fields
  timestamps: true,
});

const RestartDate = mongoose.model('RestartDate', restartDateSchema);

export default RestartDate