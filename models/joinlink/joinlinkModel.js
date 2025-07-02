import mongoose from "mongoose";

const joinlinkSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true,
    unique: true,
  },
  link: {
    type: String,
    required: true
  }
}, { timestamps: true });


const Joinlink = mongoose.model('joinlink', joinlinkSchema);

export default Joinlink