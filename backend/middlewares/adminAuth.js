import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ message: 'Não autorizado, faça login novamente' });
    }

    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    if (
      decoded_token !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: 'Não autorizado, faça login novamente' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Não autorizado, token falhou' });
  }
};

export default adminAuth;
