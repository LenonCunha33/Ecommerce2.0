// backend/middlewares/multer.js
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),            // << SEM disco
  limits: { fileSize: 8 * 1024 * 1024 },      // ~8MB por arquivo
  fileFilter: (_req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    if (!ok) return cb(new Error('Envie apenas imagens.'), false);
    cb(null, true);
  },
});

export default upload;
