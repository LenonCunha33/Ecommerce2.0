import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
  placeOrderBoleto,   // 🚀 adicionando boleto
  updateOrderStatus,
  verifyStrpePayment,
} from '../controllers/orderController.js';

import adminAuth from '../middlewares/adminAuth.js';
import { userAuth } from '../middlewares/userAuth.js';

const orderRouter = express.Router();

// Admin
orderRouter.use('/list', adminAuth, getAllOrders);
orderRouter.use('/status', adminAuth, updateOrderStatus);

// Payments
orderRouter.use('/place', userAuth, placeOrderCOD);
orderRouter.use('/stripe', userAuth, placeOrderStripe);
orderRouter.use('/boleto', userAuth, placeOrderBoleto); // 🚀 nova rota

// User
orderRouter.use('/userorders', userAuth, getUserOrders);

// Verify
orderRouter.use('/verifyStripe', userAuth, verifyStrpePayment);

export default orderRouter;
