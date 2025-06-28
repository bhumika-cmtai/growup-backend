import mongoose from "mongoose";

const applinkSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
}, { timestamps: true });


const AppLink = mongoose.model('applink', applinkSchema);

export default AppLink