import orderModel from '../models/orderModel.js';
import UserModel from '../models/userModel.js';
import Stripe from 'stripe';

// ===============================
// Configurações globais
// ===============================
const currency = 'brl';
const deliveryCharges = 15; // Taxa fixa de entrega em BRL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// Pedido com Retirada na Loja (COD)
// ===============================
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Retirada na Loja',
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await UserModel.findByIdAndUpdate(userId, { cartData: {} });

    res.status(200).json({ success: true, message: 'Ordem Realizada com Sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Pedido com Stripe (Cartão + Link)
// ===============================
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: 'Taxa de Entrega' },
        unit_amount: deliveryCharges * 100,
      },
      quantity: 1,
    });

    // ✅ Checkout dinâmico: habilita Cartão, Link, ApplePay, GooglePay, etc
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      customer_email: address.email,
      billing_address_collection: 'required',
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

// ===============================
// Pedido com Boleto Bancário
// ===============================
export const placeOrderBoleto = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Boleto Bancário',
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: 'Taxa de Entrega' },
        unit_amount: deliveryCharges * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['boleto', 'card'],
      payment_method_options: {
        boleto: { expires_after_days: 3 },
      },
      line_items,
      mode: 'payment',
      customer_email: address.email,
      billing_address_collection: 'required',
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: { orderId: newOrder._id.toString(), userId },
    });

    res.status(200).json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id,
    });

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
