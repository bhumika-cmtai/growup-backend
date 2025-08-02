import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    // unique: true 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  transactionId: {
    type: String,
    required: false
  },
  age: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required:false
  },
  gender: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['New', 'RegisterationDone', 'CallCut', 'CallNotPickUp', 'NotInterested', 'InvalidNumber'],
    default: 'New',
    required: false 
  },
  createdOn: {
    type: String,
    required: false 
  },
  updatedOn: {
    type: String,
    required: false 
  },
  reason: {
    type: String,
    required: false 
  }
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;