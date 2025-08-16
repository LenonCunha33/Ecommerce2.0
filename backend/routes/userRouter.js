import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAllUsers
} from '../controllers/userController.js';
import { userAuth } from '../middlewares/userAuth.js';

const userRouter = express.Router();

// Login
userRouter.post('/login', loginUser);

// Cadastro
userRouter.post('/register', registerUser);

// Login Admin
userRouter.post('/admin', adminLogin);

userRouter.get("/users", userAuth, getAllUsers);

// Perfil do usuário logado
userRouter.get('/profile', userAuth, getUserProfile);

// Atualizar perfil
userRouter.put('/update-profile', userAuth, updateUserProfile);

// Esqueci minha senha
userRouter.post('/forgot-password', forgotPassword);

// Redefinir senha
userRouter.post('/reset-password/:token', resetPassword);

export default userRouter;
