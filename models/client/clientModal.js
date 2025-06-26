import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    unique: true 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  createdOn: {
    type: String,
    required: false 
  },
  leaderCode: {
    type:String,
    required:false
  },
  portalName: {
    type:String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['New', 'RegisterationDone', 'CallCut', 'CallNotPickUp', 'NotInterested', 'InvalidNumber'],
    default: 'New',
    required: false 
  },
  reason: {
    type: String,
    required: false
  },
  ownerName: {
    type: [String],
    required: false
  },
  ownerNumber: {
    type: [String],
    required: false
  }
});

const Client = mongoose.model('Client', ClientSchema);

export default Client;