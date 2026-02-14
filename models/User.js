import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  username: String,
  tier: { type: String, default: "basic" }, // basic, pro, vip
  subscriptionExpires: Date
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);