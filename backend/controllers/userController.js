import UserModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

// 📌 LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Usuário não existente!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Email ou senha incorretos!' });
    }

    let token = createToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Usuário conectado com sucesso',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📌 REGISTRO
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'O usuário já existe' });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Por favor, insira um e-mail válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    let token = createToken(savedUser._id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: savedUser,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📌 LOGIN ADMIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      let token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: 'Administrador conectado com sucesso',
        data: {
          token,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'E-mail ou senha inválidos',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📌 ESQUECI A SENHA
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Informe o e-mail.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <h2>Recuperação de Senha</h2>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha',
      html: message,
    });

    res.json({ success: true, message: 'E-mail de recuperação enviado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
};

// 📌 REDEFINIR SENHA
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // 1. Validação inicial
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token de redefinição ausente.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 6 caracteres.'
      });
    }

    // 2. Cria hash do token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Procura usuário pelo token e validade
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado.'
      });
    }

    // 4. Criptografa nova senha
    const salt = await bcrypt.genSalt(12); // custo maior para mais segurança
    user.password = await bcrypt.hash(password, salt);

    // 5. Remove token de reset e expiração
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // (Opcional) Invalida sessões anteriores
    if (user.sessionTokens) {
      user.sessionTokens = [];
    }

    await user.save();

    // 6. Resposta final
    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso. Faça login novamente.'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no resetPassword:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor. Tente novamente mais tarde.'
    });
  }
};
