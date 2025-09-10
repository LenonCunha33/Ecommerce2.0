// backend/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectToCloudinary from './config/cloudinay.js'; // verifique nome do arquivo; se for cloudinary.js, ajuste o import
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import orderRouter from './routes/orderRouter.js';
import couponRouter from "./routes/couponRouter.js";
import contactRouter from "./routes/contactRouter.js";
import chatRouter from "./routes/chatRouter.js";
import { handleStripeWebhook } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Stripe webhook (raw) ANTES do json()
app.post(
  '/api/order/webhook/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// JSON + CORS
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
  ].filter(Boolean),
  credentials: true
}));

// 🔌 garante conexão em toda request (cacheado)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

// Cloudinary (se for necessário apenas uma vez por cold start)
connectToCloudinary?.();

// Rotas
app.use("/api/coupon", couponRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);

// healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  res.send('Olá');
});

// 🚀 Local: sobe o servidor; Vercel: exporta o app
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Servidor Iniciado no Link = http://localhost:${port}`);
  });
}

export default app;
