import express from 'express';
import {
  addProduct,
  removeProduct,
  getSingleProduct,
  getListProducts,
  updateProduct,      // importar a função nova
  toggleVisibility,   // importar a função nova
} from '../controllers/productController.js';
import upload from '../middlewares/multer.js';
import adminAuth from '../middlewares/adminAuth.js';

const productRouter = express.Router();

// /api/product/list
productRouter.get('/list', getListProducts);

// /api/product/add
productRouter.post(
  '/add',
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  addProduct
);

// /api/product/remove
productRouter.post('/remove', adminAuth, removeProduct);

// /api/product/single
productRouter.post('/single', getSingleProduct);

// NOVA ROTA - Atualizar produto
productRouter.put('/update', adminAuth, updateProduct);

// NOVA ROTA - Toggle visibilidade
productRouter.patch('/toggle-visibility', adminAuth, toggleVisibility);

export default productRouter;
