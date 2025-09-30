// models/productModel.js
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true }, // ex.: P, M, G
    sku: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "", trim: true },
    subCategory: { type: String, default: "", trim: true },

    // tamanhos "lógicos" do produto (P/M/G etc.)
    sizes: { type: [String], default: ["P", "M", "G"] },

    // variantes controladas no painel (estoque, sku, ativo)
    variants: { type: [VariantSchema], default: [] },

    // imagens
    image: { type: [String], default: [] },

    // destaque
    bestseller: { type: Boolean, default: false },

    // pagamento Yampi (legado - 1 link p/ todos)
    yampiLink: { type: String, default: "" },

    // NOVO: links por tamanho (ex.: { P: "https://...", M: "..." })
    yampiLinks: {
      type: Map,
      of: String,
      default: {},
    },

    // visibilidade de catálogo
    visible: { type: Boolean, default: true },

    // soft delete opcional
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
