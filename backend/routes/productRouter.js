// backend/routes/productRouter.js
import express from 'express';
import {
  addProduct,
  removeProduct,
  getSingleProduct,
  getListProducts,
  updateProduct,           // já existia
  toggleVisibility,        // já existia

  // ⬇️ Controladores de variantes/estoque (já implementados no seu controller)
  toggleVariantActive,     // PATCH  /:id/variant/toggle
  adjustVariantStock,      // PATCH  /:id/variant/stock
  upsertVariant,           // PUT    /:id/variant/upsert
  deleteVariant            // DELETE /:id/variant   (req.body.size)
} from '../controllers/productController.js';
import upload from '../middlewares/multer.js';
import adminAuth from '../middlewares/adminAuth.js';

const productRouter = express.Router();

/**
 * Lista de produtos (pública ou admin, conforme sua lógica atual)
 * GET /api/product/list
 */
productRouter.get('/list', getListProducts);

/**
 * Adicionar produto (admin)
 * POST /api/product/add
 */
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

/**
 * Remover produto (admin)
 * POST /api/product/remove
 */
productRouter.post('/remove', adminAuth, removeProduct);

/**
 * Buscar único produto (detalhe)
 * POST /api/product/single
 */
productRouter.post('/single', getSingleProduct);

/**
 * Atualizar dados básicos do produto (nome, categoria, preço etc.) (admin)
 * PUT /api/product/update
 */
productRouter.put('/update', adminAuth, updateProduct);

/**
 * Alternar visibilidade do produto (admin)
 * PATCH /api/product/toggle-visibility
 * body: { id, visible }
 */
productRouter.patch('/toggle-visibility', adminAuth, toggleVisibility);

/* ============================================================
 *                 ROTAS DE VARIANTES / ESTOQUE (admin)
 *  Compatíveis com o frontend que você já montou no List.jsx
 * ============================================================
 */

/**
 * Ativar/Desativar variante (tamanho) do produto
 * PATCH /api/product/:id/variant/toggle
 * body: { size, isActive }
 */
productRouter.patch('/:id/variant/toggle', adminAuth, toggleVariantActive);

/**
 * Ajuste de estoque por tamanho (delta positivo/negativo)
 * PATCH /api/product/:id/variant/stock
 * body: { size, qty, reason }
 *  - qty: número (ex.: -1, +1, +5)
 *  - reason: opcional, para log/auditoria
 */
productRouter.patch('/:id/variant/stock', adminAuth, adjustVariantStock);

/**
 * Criar/atualizar (upsert) variante (tamanho)
 * PUT /api/product/:id/variant/upsert
 * body:
 *   - para atualizar (renomear): { originalSize, size, sku?, stock?, isActive? }
 *   - para criar: { size, sku?, stock?, isActive? }
 */
productRouter.put('/:id/variant/upsert', adminAuth, upsertVariant);

/**
 * Remover variante (tamanho) do produto
 * DELETE /api/product/:id/variant
 * body: { size }
 *  (axios envia body em DELETE; se preferir, pode mudar para query ?size=)
 */
productRouter.delete('/:id/variant', adminAuth, deleteVariant);

export default productRouter;
