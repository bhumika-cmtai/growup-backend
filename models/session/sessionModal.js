// models/session/globalSessionModel.js

import mongoose from "mongoose";
const { Schema } = mongoose;

const globalSessionSchema = new Schema(
  {
    // A fixed, unique identifier to ensure only one document can exist.
    name: {
      type: String,
      default: 'global_session_schedule',
      unique: true,
      required: true,
    },
    sessionStartDate: {
      type: Date,
      default: null,
    },
    sessionStartTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format.'],
      default: null,
    },
    sessionEndDate: {
      type: Date,
      default: null,
    },
    sessionEndTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format.'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const GlobalSession = mongoose.model('session', globalSessionSchema);

export default GlobalSession;