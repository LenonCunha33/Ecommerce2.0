// backend/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectToCloudinary from './config/cloudinay.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import orderRouter from './routes/orderRouter.js';
import couponRouter from "./routes/couponRouter.js";
import contactRouter from "./routes/contactRouter.js";
import { handleStripeWebhook } from './controllers/orderController.js';
import chatRouter from "./routes/chatRouter.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectToCloudinary();

// ===== Stripe Webhook precisa vir ANTES do express.json() =====
app.post(
  '/api/order/webhook/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Middlewares comuns
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/coupon", couponRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);

app.get('/', (req, res) => {
  res.send('Olá');
});

// Listener
app.listen(port, () => {
  console.log(`Servidor Iniciado no Link = http://localhost:${port}`);
});
