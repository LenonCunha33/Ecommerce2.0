import mongoose from "mongoose";

const inventoryTxSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true },
  qty: { type: Number, required: true }, // negativo p/ saída, positivo p/ entrada
  type: { type: String, enum: ["order_decrement", "manual_adjust", "revert"], required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason:  { type: String }
}, { timestamps: true });

const InventoryTx = mongoose.models.InventoryTx || mongoose.model("InventoryTx", inventoryTxSchema);
export default InventoryTx;
