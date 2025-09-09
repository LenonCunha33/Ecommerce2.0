import orderModel from '../models/orderModel.js';
import UserModel from '../models/userModel.js';
import ProductModel from '../models/productModel.js';
import Stripe from 'stripe';
import { sendOrderStatusEmail } from '../utils/sendEmail.js';

const currency = 'brl';
const deliveryCharges = 15; // R$
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CANCEL_STATUS = 'Cancelado';

// ===== Utils de valores =====
function computeSubtotalCents(items) {
  return items.reduce((acc, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) return acc;
    const unit = Math.round(price * 100);
    return acc + unit * qty;
  }, 0);
}
function normalizeDiscountCents(discountFromBody, subtotalCents) {
  const raw = Math.round(Number(discountFromBody || 0) * 100);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(raw, subtotalCents);
}
async function createOneOffCoupon(discountCents) {
  if (discountCents <= 0) return null;
  const coupon = await stripe.coupons.create({
    amount_off: discountCents,
    currency,
    duration: 'once',
    max_redemptions: 1,
    name: `Desconto R$ ${(discountCents / 100).toFixed(2)}`
  });
  return coupon?.id || null;
}

// ===== Estoque: baixa ao finalizar/entregar =====
function normalizeItem(item) {
  return {
    productId: item.productId || item._id || item.product?._id,
    size: item.size,
    quantity: Number(item.quantity) || 1
  };
}
async function decrementOrderItems(orderDoc) {
  if (orderDoc.inventoryAdjusted) return;

  for (const raw of orderDoc.items || []) {
    const { productId, size, quantity } = normalizeItem(raw);
    if (!productId || !size || quantity <= 0) continue;

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId, 'variants.size': size },
      { $inc: { 'variants.$.stock': -quantity } },
      { new: true }
    );
    if (!updated) continue;

    updated.normalizeVariantActivation?.();
    updated.recalcSizesFromVariants?.();
    await updated.save();
  }

  orderDoc.inventoryAdjusted = true;
  await orderDoc.save();
}

// ===== Cancelamento centralizado =====
async function cancelOrderById(orderId, emailReason = 'Cancelado') {
  const order = await orderModel.findByIdAndUpdate(
    orderId,
    { payment: false, orderStatus: CANCEL_STATUS },
    { new: true }
  ).populate('userId');

  if (order) {
    const userEmail = order?.address?.email || order?.userId?.email;
    const userName = order?.userId?.name || userEmail;
    if (userEmail) {
      try {
        await sendOrderStatusEmail(CANCEL_STATUS, {
          orderId: order._id.toString(),
          items: order.items,
          total: order.amount,
          userEmail,
          userName
        });
      } catch (e) {
        console.error('[email cancelado] erro:', e?.message);
      }
    }
  }
  return order;
}

// ------------------ CARTÃO / LINK ------------------
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items = [], address = {}, discount: discountFromBody = 0 } = req.body;
    const { origin } = req.headers;

    const subtotalCents = computeSubtotalCents(items);
    const deliveryCents = deliveryCharges * 100;
    const discountCents = normalizeDiscountCents(discountFromBody, subtotalCents);

    const orderData = {
      userId,
      items,
      amount: (subtotalCents + deliveryCents - discountCents) / 100,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now(),
      discount: discountCents / 100,
      delivery_fee: deliveryCharges,
      orderStatus: 'Pedido Realizado',
      // inventoryAdjusted: false (no schema)
    };
    const newOrder = await new orderModel(orderData).save();

    const user = await UserModel.findById(userId).lean();
    const userEmail = address?.email || user?.email;
    const userName = user?.name || userEmail;
    if (userEmail) {
      await sendOrderStatusEmail('Pedido Realizado', {
        orderId: newOrder._id.toString(),
        items: newOrder.items,
        total: newOrder.amount,
        userEmail,
        userName
      });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const couponId = await createOneOffCoupon(discountCents);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['BR'] },
      shipping_options: [{
        shipping_rate_data: {
          display_name: 'Entrega padrão',
          type: 'fixed_amount',
          fixed_amount: { amount: deliveryCents, currency },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 }
          }
        }
      }],
      line_items,
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: { orderId: newOrder._id.toString(), userId },
    });

    // (Opcional) você pode salvar session.id no pedido para auditoria
    res.status(200).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------ BOLETO ------------------
export const placeOrderBoleto = async (req, res) => {
  try {
    const { userId, items = [], address = {}, discount: discountFromBody = 0 } = req.body;
    const { origin } = req.headers;

    const subtotalCents = computeSubtotalCents(items);
    const deliveryCents = deliveryCharges * 100;
    const discountCents = normalizeDiscountCents(discountFromBody, subtotalCents);

    const orderData = {
      userId,
      items,
      amount: (subtotalCents + deliveryCents - discountCents) / 100,
      address,
      paymentMethod: 'Boleto Bancário',
      payment: false,
      date: Date.now(),
      discount: discountCents / 100,
      delivery_fee: deliveryCharges,
      orderStatus: 'Pedido Realizado',
    };
    const newOrder = await new orderModel(orderData).save();

    const user = await UserModel.findById(userId).lean();
    const userEmail = address?.email || user?.email;
    const userName = user?.name || userEmail;
    if (userEmail) {
      await sendOrderStatusEmail('Pedido Realizado', {
        orderId: newOrder._id.toString(),
        items: newOrder.items,
        total: newOrder.amount,
        userEmail,
        userName
      });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const couponId = await createOneOffCoupon(discountCents);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['boleto', 'card'],
      payment_method_options: { boleto: { expires_after_days: 3 } },
      customer_email: userEmail,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['BR'] },
      shipping_options: [{
        shipping_rate_data: {
          display_name: 'Entrega padrão',
          type: 'fixed_amount',
          fixed_amount: { amount: deliveryCents, currency },
        }
      }],
      line_items,
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: { orderId: newOrder._id.toString(), userId },
    });

    res.status(200).json({ success: true, session_url: session.url, orderId: newOrder._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Webhook do Stripe (cartão + boleto)
// ===============================
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          const orderId = session.metadata.orderId;
          const userId = session.metadata.userId;

          const order = await orderModel.findByIdAndUpdate(
            orderId,
            { payment: true, orderStatus: 'Embalando' },
            { new: true }
          ).populate('userId');

          await UserModel.findByIdAndUpdate(userId, { cartData: {} });

          const userEmail = order?.address?.email || order?.userId?.email;
          const userName = order?.userId?.name || userEmail;
          if (userEmail) {
            await sendOrderStatusEmail('Embalando', {
              orderId,
              items: order.items,
              total: order.amount,
              userEmail,
              userName
            });
          }
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        const order = await orderModel.findByIdAndUpdate(
          orderId,
          { payment: true, orderStatus: 'Embalando' },
          { new: true }
        ).populate('userId');

        await UserModel.findByIdAndUpdate(userId, { cartData: {} });

        const userEmail = order?.address?.email || order?.userId?.email;
        const userName = order?.userId?.name || userEmail;
        if (userEmail) {
          await sendOrderStatusEmail('Embalando', {
            orderId,
            items: order.items,
            total: order.amount,
            userEmail,
            userName
          });
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        // boleto/cartão falhou -> marca Cancelado (não deleta)
        const session = event.data.object;
        await cancelOrderById(session.metadata.orderId, 'async_payment_failed');
        break;
      }

      case 'checkout.session.expired': {
        // usuário abandonou/ sessão venceu -> marca Cancelado
        const session = event.data.object;
        await cancelOrderById(session.metadata.orderId, 'checkout.session.expired');
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// ===============================
// Verificar pagamento (endpoint legado)
// ===============================
export const verifyStrpePayment = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true, orderStatus: 'Embalando' });
      await UserModel.findByIdAndUpdate(userId, { cartData: {} });

      const order = await orderModel.findById(orderId).populate('userId');
      const userEmail = order?.address?.email || order?.userId?.email;
      const userName = order?.userId?.name || userEmail;
      if (userEmail) {
        await sendOrderStatusEmail('Embalando', {
          orderId,
          items: order.items,
          total: order.amount,
          userEmail,
          userName
        });
      }

      res.status(200).json({ success: true, message: 'Pagamento Realizado!' });
    } else {
      // ❗ antes deletava; agora marcamos como Cancelado
      await orderModel.findByIdAndUpdate(orderId, { payment: false, orderStatus: CANCEL_STATUS });
      res.status(200).json({ success: false, message: 'Pagamento cancelado pelo usuário.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Admin: listar todos pedidos
// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Usuário: listar pedidos
// ===============================
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Atualizar status do pedido (ADMIN)
// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus, trackingCode, carrier } = req.body;

    const order = await orderModel
      .findByIdAndUpdate(
        orderId,
        {
          orderStatus,
          ...(trackingCode ? { trackingCode } : {}),
          ...(carrier ? { carrier } : {})
        },
        { new: true }
      )
      .populate('userId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    const lowersStockStates = ['Entregue', 'Finalizado'];
    if (lowersStockStates.includes(orderStatus) && !order.inventoryAdjusted) {
      try {
        await decrementOrderItems(order);
      } catch (e) {
        console.error('[inventory] erro ao dar baixa:', e);
      }
    }

    const userEmail = order?.address?.email || order?.userId?.email;
    const userName = order?.userId?.name || userEmail;

    if (userEmail) {
      await sendOrderStatusEmail(orderStatus, {
        orderId: order._id.toString(),
        items: order.items,
        total: order.amount,
        userEmail,
        userName,
        trackingCode: order.trackingCode,
        carrier: order.carrier
      });
    }

    res.status(200).json({ success: true, message: 'Status do Pedido Atualizado com Sucesso', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
