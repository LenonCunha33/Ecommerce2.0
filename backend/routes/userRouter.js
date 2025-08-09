import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
} from '../controllers/userController.js';
import { forgotPassword, resetPassword } from '../controllers/userController.js';

const userRouter = express.Router();

// Login
userRouter.post('/login', loginUser);

// Cadastro
userRouter.post('/register', registerUser);

// Login Admin
userRouter.post('/admin', adminLogin);

// Esqueci minha senha
userRouter.post('/forgot-password', forgotPassword);

// Redefinir senha
userRouter.post('/reset-password/:token', resetPassword);

export default userRouter;
