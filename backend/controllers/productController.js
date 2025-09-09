// backend/controllers/productController.js
import { v2 as cloudinary } from 'cloudinary';
import ProductModel from '../models/productModel.js';

/* ============================
 *  UPLOAD: BUFFER → CLOUDINARY
 * ============================ */
function uploadFromBufferToCloudinary(file, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'products', ...opts },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    // file.buffer vem do multer.memoryStorage()
    stream.end(file.buffer);
  });
}

/* ============================
 *        UTIL INTERNO
 * ============================ */
function normalizeVariantInput(v) {
  const size = (v?.size || '').trim();
  if (!size) return null;
  const sku = (v?.sku || '').trim() || undefined;
  const n = Number(v?.stock ?? 0);
  const stock = Number.isFinite(n) && n >= 0 ? n : 0;
  const isActive = typeof v?.isActive === 'boolean' ? v.isActive : stock > 0;
  return { size, sku, stock, isActive };
}

/* ============================
 *       CRUD DE PRODUTO
 * ============================ */

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,      // string JSON (compat)
      bestseller,
      variants    // string JSON opcional: [{ size, sku?, stock?, isActive? }, ...]
    } = req.body;

    // arquivos vindos do upload.fields([...]) (com memoryStorage: têm .buffer)
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const files = [image1, image2, image3, image4].filter(Boolean);

    if (files.length === 0) {
      throw new Error('Por favor, carregue pelo menos uma imagem');
    }

    // (opcional) validar tipo
    for (const f of files) {
      if (!/^image\//.test(f.mimetype || '')) {
        throw new Error('Arquivos inválidos: envie apenas imagens.');
      }
    }

    // Envia direto do buffer para a Cloudinary
    const uploads = await Promise.all(files.map((f) => uploadFromBufferToCloudinary(f)));
    const imageUrl = uploads.map((u) => u.secure_url);

    // Parse de sizes (compat)
    let parsedSizes = [];
    try {
      if (sizes) {
        const s = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        if (Array.isArray(s)) parsedSizes = s.filter(Boolean).map(String);
      }
    } catch {
      parsedSizes = [];
    }

    // Parse opcional de variants
    let parsedVariants = [];
    try {
      if (variants) {
        const v = typeof variants === 'string' ? JSON.parse(variants) : variants;
        if (Array.isArray(v)) parsedVariants = v.map(normalizeVariantInput).filter(Boolean);
      }
    } catch {
      parsedVariants = [];
    }

    const product = new ProductModel({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: parsedSizes,       // será recalculado no save a partir das variants ativas com stock > 0
      variants: parsedVariants, // se vazio, criaremos abaixo a partir de sizes
      bestseller: bestseller === 'true' || bestseller === true,
      image: imageUrl,
      date: Date.now(),
      visible: true
    });

    // Se não veio variants, criar a partir de sizes com stock=0 e isActive=false
    if (!product.variants?.length && parsedSizes.length) {
      product.variants = parsedSizes.map((sz) => ({
        size: sz.trim(),
        stock: 0,
        isActive: false
      }));
    }

    // Normaliza, recalcula sizes e salva
    product.normalizeVariantActivation?.();
    product.recalcSizesFromVariants?.();
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produto Adicionado!',
      product,
    });
  } catch (error) {
    console.error('[addProduct] erro:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getListProducts = async (_req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto Não Encontrado!' });
    }
    res.status(200).json({ success: true, message: 'Produto Removido Com Sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto Não Encontrado!' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar informações básicas do produto
export const updateProduct = async (req, res) => {
  try {
    const { id, name, category, price } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });
    }
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { name, category, price },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.json({ success: true, message: 'Produto atualizado com sucesso', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Alterar visibilidade do produto
export const toggleVisibility = async (req, res) => {
  try {
    const { id, visible } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });
    }
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { visible },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.json({ success: true, message: 'Visibilidade atualizada', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
 *     VARIANTES / ESTOQUE (NOVAS ROTAS)
 * ========================================= */

/**
 * PATCH /api/product/:id/variant/toggle
 * body: { size, isActive }
 */
export const toggleVariantActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, isActive } = req.body;
    if (!size || typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos.' });
    }

    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    if (!Array.isArray(product.variants)) product.variants = [];
    const v = product.variants.find(v => v.size === size);
    if (!v) return res.status(404).json({ success: false, message: 'Tamanho não encontrado.' });

    v.isActive = !!isActive;

    product.normalizeVariantActivation?.();
    product.recalcSizesFromVariants?.();
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erro ao alterar disponibilidade do tamanho.' });
  }
};

/**
 * PATCH /api/product/:id/variant/stock
 * body: { size, qty }
 *  - qty é o delta (positivo/negativo)
 */
export const adjustVariantStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, qty } = req.body;

    const delta = Number(qty);
    if (!size || !Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ success: false, message: 'Informe size e um qty diferente de 0.' });
    }

    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    if (!Array.isArray(product.variants)) product.variants = [];
    const v = product.variants.find(v => v.size === size);
    if (!v) return res.status(404).json({ success: false, message: 'Tamanho não encontrado.' });

    v.stock = Math.max(0, (Number(v.stock) || 0) + delta);
    // Ativação automática simples
    if (v.stock <= 0) v.isActive = false;
    if (v.stock > 0 && v.isActive === false) v.isActive = true;

    product.normalizeVariantActivation?.();
    product.recalcSizesFromVariants?.();
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erro ao ajustar estoque do tamanho.' });
  }
};

/**
 * PUT /api/product/:id/variant/upsert
 * body (atualizar): { originalSize, size, sku?, stock?, isActive? }
 * body (criar):     { size, sku?, stock?, isActive? }
 */
export const upsertVariant = async (req, res) => {
  try {
    const { id } = req.params;
    let { originalSize, size, sku, stock, isActive } = req.body;

    size = (size || '').trim();
    if (!size) return res.status(400).json({ success: false, message: 'O campo size é obrigatório.' });

    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    if (!Array.isArray(product.variants)) product.variants = [];

    if (originalSize) {
      // atualizar existente / renomear
      const v = product.variants.find(v => v.size === originalSize);
      if (!v) return res.status(404).json({ success: false, message: 'Tamanho original não encontrado.' });

      if (size !== originalSize && product.variants.some(x => x.size === size)) {
        return res.status(409).json({ success: false, message: 'Já existe uma variante com esse tamanho.' });
      }

      v.size = size;
      if (typeof sku === 'string') v.sku = sku.trim();
      if (stock !== undefined) {
        const n = Number(stock);
        if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: 'Estoque inválido.' });
        v.stock = n;
      }
      if (typeof isActive === 'boolean') v.isActive = isActive;

    } else {
      // criar nova
      if (product.variants.some(x => x.size === size)) {
        return res.status(409).json({ success: false, message: 'Já existe uma variante com esse tamanho.' });
      }
      const n = stock === undefined ? 0 : Number(stock);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: 'Estoque inválido.' });

      product.variants.push({
        size,
        sku: (sku || '').trim() || undefined,
        stock: n,
        isActive: typeof isActive === 'boolean' ? isActive : n > 0
      });
    }

    product.normalizeVariantActivation?.();
    product.recalcSizesFromVariants?.();
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erro ao salvar variante.' });
  }
};

/**
 * DELETE /api/product/:id/variant
 * body: { size }
 */
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size } = req.body;
    if (!size) return res.status(400).json({ success: false, message: 'Informe o tamanho (size).' });

    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    const before = product.variants?.length || 0;
    product.variants = (product.variants || []).filter(v => v.size !== size);
    const after = product.variants.length;

    if (before === after) {
      return res.status(404).json({ success: false, message: 'Tamanho não encontrado.' });
    }

    product.recalcSizesFromVariants?.();
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erro ao remover variante.' });
  }
};
