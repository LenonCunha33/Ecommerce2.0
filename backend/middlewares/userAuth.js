import jwt from 'jsonwebtoken';

export const userAuth = async (req, res, next) => {
  let token = req.headers.token || req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, faça login novamente' });
  }

  // Se vier como "Bearer token", remove o "Bearer "
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decoded.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
