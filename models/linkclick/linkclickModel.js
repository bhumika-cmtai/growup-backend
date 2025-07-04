import mongoose from "mongoose";
const LinkClickSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['complete','inComplete'],
    default: 'complete',
    required: false 
  },
  reason: {
    type: String,
    required: false
  }
});

const LinkClick = mongoose.model('linkClick', LinkClickSchema);

export default LinkClick;