// backend/models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // userId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Itens do pedido (mantém seu formato atual)
  items: { type: [], required: true },

  // Valor total em R$
  amount: { type: Number, required: true },

  // Endereço e dados de contato (usa address.email no create)
  address: { type: Object, required: true },
  
  inventoryAdjusted: { type: Boolean, default: false },

  // Status logístico do pedido (labels PT-BR, como você já usa)
  orderStatus: {
    type: String,
    required: true,
    enum: [
      'Pedido Realizado',
      'Embalando',
      'Enviado',
      'Saiu Para Entrega',
      'Entregue',
      'Finalizado',
      'Cancelado',                 // <- já usamos ao sair do checkout
      'Parcialmente Reembolsado',  // <- novo
      'Reembolsado'
    ],
    default: 'Pedido Realizado'
  },

  // Método e indicador de pagamento
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },

  // Epoch time
  date: { type: Number, required: true },

  // (Opcional) rastreio quando aplicável
  trackingCode: { type: String },
  carrier: { type: String }
}, { timestamps: true });

const orderModel =
  mongoose.models.order || mongoose.model('Order', orderSchema);

export default orderModel;
