import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    unique: true 
  },
  password: {
    type: String,
    required: false 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  whatsappNumber: {
    type: String,
    required: false 
  },
  city: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: false 
  },
  status: {
    type: String,
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
  leaderCode: {
    type: String,
    required: false
  },
  work_experience: {
    type: String,
    required: false
  },
  abhi_aap_kya_karte_hai: {
    type: String,
    required: false
  },

});

const User = mongoose.model('User', userSchema);

export default User;