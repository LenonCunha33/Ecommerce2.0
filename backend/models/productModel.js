// backend/models/productModel.js
import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    size:     { type: String, required: true, trim: true }, // P, M, G, etc.
    sku:      { type: String, trim: true },
    stock:    { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true } // controla exibição no site
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    image:       { type: Array,  required: true },
    category:    { type: String, required: true },
    subCategory: { type: String, required: true },

    /**
     * COMPATIBILIDADE:
     * Você já usava `sizes: []` no frontend. Manteremos esse campo,
     * mas agora ele será alimentado automaticamente a partir de `variants`
     * (somente variantes com stock > 0 e isActive = true).
     */
    sizes:       { type: Array, required: true, default: [] },

    /**
     * NOVO: Variantes com estoque por tamanho.
     */
    variants: { type: [variantSchema], default: [] },

    bestseller:  { type: Boolean },
    date:        { type: Number, required: true },
    visible:     { type: Boolean, default: true } // campo de visibilidade
  },
  { timestamps: true }
);

/**
 * Virtual de disponibilidade geral do produto
 * (true se ao menos uma variante ativa tem estoque > 0).
 */
productSchema.virtual('inStock').get(function () {
  return this.variants?.some(v => v.isActive && v.stock > 0);
});

/**
 * Helper: recalcular `sizes` com base nas variantes ativas com estoque > 0.
 */
productSchema.methods.recalcSizesFromVariants = function () {
  const activeSizes = (this.variants || [])
    .filter(v => v.isActive && v.stock > 0)
    .map(v => v.size);

  // Evita reordenações desagradáveis: usa Set e mantém ordem original sempre que possível
  const unique = Array.from(new Set(activeSizes));
  this.sizes = unique;
};

/**
 * Helper: pós-atualização de estoque — se uma variante ficou <= 0, desativa;
 * se ficou > 0 e estava desativada, reativa (regra opcional).
 */
productSchema.methods.normalizeVariantActivation = function () {
  let changed = false;
  for (const v of this.variants || []) {
    if (v.stock <= 0 && v.isActive) {
      v.isActive = false;
      v.stock = Math.max(0, v.stock);
      changed = true;
    } else if (v.stock > 0 && !v.isActive) {
      // Se você preferir manter desativada manualmente mesmo com estoque, remova esta reativação.
      v.isActive = true;
      changed = true;
    }
  }
  if (changed) {
    // nada aqui; será salvo no fluxo normal
  }
};

// Mantém `sizes` e flags coerentes antes de salvar
productSchema.pre('save', function (next) {
  try {
    this.normalizeVariantActivation();
    this.recalcSizesFromVariants();
    next();
  } catch (err) {
    next(err);
  }
});

const ProductModel =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default ProductModel;
