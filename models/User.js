import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, unique: true, index: true },
    username: { type: String, index: true },

    tier: { type: String, default: "basic" }, // basic | pro | vip
    subscriptionExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
