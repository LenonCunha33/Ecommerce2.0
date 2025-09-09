import Product from "../models/productModel.js";
import InventoryTx from "../models/inventoryTxModel.js";

export async function decrementOrderItems(order, userId = null) {
  // Idempotência: se já ajustado, não faz nada
  if (order.inventoryAdjusted) return;

  for (const item of order.items) {
    // Ajuste por produto/tamanho
    const { productId, size, quantity } = normalizeItem(item);

    // 1) baixa estoque
    const updated = await Product.findOneAndUpdate(
      { _id: productId, "variants.size": size },
      { $inc: { "variants.$.stock": -quantity } },
      { new: true }
    );

    if (!updated) continue;

    // 2) se chegou a 0 (ou menos), desativa essa variante
    const v = updated.variants.find(v => v.size === size);
    if (v && v.stock <= 0 && v.isActive) {
      await Product.updateOne(
        { _id: productId, "variants.size": size },
        { $set: { "variants.$.isActive": false, "variants.$.stock": Math.max(0, v.stock) } }
      );
    }

    // 3) log opcional
    try {
      await InventoryTx.create({
        productId,
        size,
        qty: -quantity,
        type: "order_decrement",
        orderId: order._id,
        userId
      });
    } catch {}
  }

  order.inventoryAdjusted = true;
  await order.save();
}

export async function manualAdjust({ productId, size, qty, userId, reason }) {
  // qty positivo = entrada; negativo = saída
  const updated = await Product.findOneAndUpdate(
    { _id: productId, "variants.size": size },
    { $inc: { "variants.$.stock": qty } },
    { new: true }
  );
  if (!updated) throw new Error("Produto/variante não encontrado");

  // Regras de ativação/desativação automáticas
  const v = updated.variants.find(v => v.size === size);
  if (v) {
    if (v.stock <= 0 && v.isActive) {
      await Product.updateOne(
        { _id: productId, "variants.size": size },
        { $set: { "variants.$.isActive": false, "variants.$.stock": Math.max(0, v.stock) } }
      );
    }
    if (v.stock > 0 && !v.isActive) {
      await Product.updateOne(
        { _id: productId, "variants.size": size },
        { $set: { "variants.$.isActive": true } }
      );
    }
  }

  // Log
  try {
    await InventoryTx.create({ productId, size, qty, type: "manual_adjust", userId, reason });
  } catch {}

  return updated;
}

// Ajuste seu item conforme sua estrutura
function normalizeItem(item) {
  // Exemplo comum:
  return {
    productId: item.productId || item._id, // adapte ao seu formato
    size: item.size,
    quantity: item.quantity || 1
  };
}
