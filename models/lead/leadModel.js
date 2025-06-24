import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
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
  qualification: {
    type: String,
    required: false
  },
  source: {
    type:String,
    required: false
  },
  date_of_birth: {
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
    enum: ['New', 'Contacted', 'NotInterested'],
    default: 'Active',
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
  message: {
    type:String,
    required: false
  },
  reason: {
    type: String,
    required: false 
  }
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;