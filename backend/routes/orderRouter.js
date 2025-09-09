// backend/routes/orderRouter.js
import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  placeOrderStripe,
  placeOrderBoleto,
  updateOrderStatus,
  verifyStrpePayment
} from '../controllers/orderController.js';

import adminAuth from '../middlewares/adminAuth.js';
import { userAuth } from '../middlewares/userAuth.js';

const orderRouter = express.Router();

// Admin
orderRouter.use('/list', adminAuth, getAllOrders);
orderRouter.use('/status', adminAuth, updateOrderStatus);

// Payments
orderRouter.use('/stripe', userAuth, placeOrderStripe);
orderRouter.use('/boleto', userAuth, placeOrderBoleto);

// User
orderRouter.use('/userorders', userAuth, getUserOrders);

// Verify (legado)
orderRouter.use('/verifyStripe', userAuth, verifyStrpePayment);

export default orderRouter;
