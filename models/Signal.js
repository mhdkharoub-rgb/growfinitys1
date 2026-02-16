import mongoose from "mongoose";

const SignalSchema = new mongoose.Schema(
  {
    asset: { type: String, index: true },          // BTCUSDT, EURUSD, etc
    market: { type: String, index: true },         // crypto | forex | tokens
    timeframe: { type: String, index: true },      // daily | weekly | monthly
    side: { type: String },                        // buy | sell
    entry: { type: Number },
    takeProfit: { type: Number },
    stopLoss: { type: Number },
    notes: { type: String },

    tier: { type: String, default: "basic" }       // basic | pro | vip
  },
  { timestamps: true }
);

export default mongoose.models.Signal || mongoose.model("Signal", SignalSchema);
