import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  portalName: {
    type: String,
    required: true, 
    unique: true,   
    trim: true
  },
  link: {
    type: String,
    required: true, 
    trim: true
  },
  commission: {
    type: String,
    required: false
  }
});

const Link = mongoose.model('links', linkSchema);

export default Link;