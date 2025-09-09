// backend/middlewares/multer.js
import multer from 'multer';

// Vercel: filesystem é read-only. Usamos memória (Buffer) e enviamos direto ao Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo (ajuste se quiser)
  },
  // (opcional) filtrar tipos
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype || '')) {
      return cb(new Error('Envie apenas imagens.'));
    }
    cb(null, true);
  },
});

export default upload;
