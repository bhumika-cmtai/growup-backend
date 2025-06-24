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
  tlCode: {
    type:String,
    required:false
  },
  portalName: {
    type:String,
    required: false
  },
  source: {
    type: [String],
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
    enum: ['New', 'Contacted', 'Interested', 'Not Interested', 'Converted'],
    default: 'New',
    required: false 
  },
});

const Client = mongoose.model('Client', ClientSchema);

export default Client;