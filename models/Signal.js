import mongoose from "mongoose";

const SignalSchema = new mongoose.Schema({
  asset: String,
  type: String, // buy / sell
  entry: Number,
  takeProfit: Number,
  stopLoss: Number,
  tier: String, // basic, pro, vip
  timeframe: String // daily, weekly, monthly
}, { timestamps: true });

export default mongoose.models.Signal || mongoose.model("Signal", SignalSchema);