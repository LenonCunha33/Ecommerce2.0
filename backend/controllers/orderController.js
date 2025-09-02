// backend/controllers/orderController.js
import orderModel from '../models/orderModel.js';
import UserModel from '../models/userModel.js';
import Stripe from 'stripe';

const currency = 'brl';
const deliveryCharges = 15; // R$
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Util: soma subtotal em centavos a partir dos itens recebidos
function computeSubtotalCents(items) {
  return items.reduce((acc, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) return acc;
    const unit = Math.round(price * 100);      // centavos
    return acc + unit * qty;
  }, 0);
}

// Util: normaliza o desconto (centavos) para [0 .. subtotal]
function normalizeDiscountCents(discountFromBody, subtotalCents) {
  const raw = Math.round(Number(discountFromBody || 0) * 100);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(raw, subtotalCents);
}

// Cria cupom one-off no Stripe para aplicar no Checkout (retorna id ou null)
async function createOneOffCoupon(discountCents) {
  if (discountCents <= 0) return null;
  const coupon = await stripe.coupons.create({
    amount_off: discountCents,
    currency,          // 'brl'
    duration: 'once',  // aplica uma vez
    max_redemptions: 1,
    name: `Desconto R$ ${(discountCents/100).toFixed(2)}`
  });
  return coupon?.id || null;
}

// ------------------ CARTÃO / LINK ------------------
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items = [], address = {}, discount: discountFromBody = 0 } = req.body;
    const { origin } = req.headers;

    // 1) Calcular valores no backend (segurança)
    const subtotalCents = computeSubtotalCents(items);
    const deliveryCents = deliveryCharges * 100;
    const discountCents = normalizeDiscountCents(discountFromBody, subtotalCents);

    // 2) Persistir pedido (com total já consolidado)
    const orderData = {
      userId,
      items,
      amount: (subtotalCents + deliveryCents - discountCents) / 100, // em R$
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now(),
      discount: discountCents / 100,
      delivery_fee: deliveryCharges
    };
    const newOrder = await new orderModel(orderData).save();

    // 3) Montar line_items (somente produtos; frete via shipping_options)
    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100), // inteiro não-negativo
      },
      quantity: Number(item.quantity),
    }));

    // 4) Criar cupom no Stripe (se houver desconto)
    const couponId = await createOneOffCoupon(discountCents);

    // 5) Criar sessão de Checkout com frete e desconto corretos
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: address.email,
      billing_address_collection: 'required',

      // Frete como shipping_option para não ser afetado por desconto
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
      delivery_fee: deliveryCharges
    };
    const newOrder = await new orderModel(orderData).save();

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

      customer_email: address.email,
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
        // Pagamento imediato (Cartão ou Link)
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await orderModel.findByIdAndUpdate(session.metadata.orderId, { payment: true });
          await UserModel.findByIdAndUpdate(session.metadata.userId, { cartData: {} });
        }
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        // Boleto pago
        const session = event.data.object;
        await orderModel.findByIdAndUpdate(session.metadata.orderId, { payment: true });
        await UserModel.findByIdAndUpdate(session.metadata.userId, { cartData: {} });
        break;
      }
      case 'checkout.session.async_payment_failed': {
        // Boleto expirado ou falhou
        const session = event.data.object;
        await orderModel.findByIdAndDelete(session.metadata.orderId);
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
// Verificar pagamento (endpoint antigo)
// ===============================
export const verifyStrpePayment = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await UserModel.findByIdAndUpdate(userId, { cartData: {} });
      res.status(200).json({ success: true, message: 'Pagamento Realizado!' });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.status(200).json({ success: false, message: 'Falha no Pagamento!' });
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
// Atualizar status do pedido
// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { orderStatus });
    res.status(200).json({ success: true, message: 'Status do Pedido Atualizado com Sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
