// routes/productRouter.js
import { Router } from "express";
import {
  addProduct,
  updateProduct,
  listProducts,
  removeProduct,
  toggleVisibility,
  upsertVariant,
  toggleVariant,
  adjustVariantStock,
  deleteVariant,
} from "../controllers/productController.js";
import adminAuth from "../middlewares/adminAuth.js";
import upload from "../middlewares/multer.js";

const router = Router();

// público
router.get("/list", listProducts);

// admin: add/update aceitando image1..image4
const imagesFields = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

router.post("/add", adminAuth, imagesFields, addProduct);
router.put("/update/:id", adminAuth, imagesFields, updateProduct);

// ❗ rotas que estavam faltando (404)
router.post("/remove", adminAuth, removeProduct);
router.patch("/toggle-visibility", adminAuth, toggleVisibility);

// Variants (usadas pelo List.jsx)
router.put("/:productId/variant/upsert", adminAuth, upsertVariant);
router.patch("/:productId/variant/toggle", adminAuth, toggleVariant);
router.patch("/:productId/variant/stock", adminAuth, adjustVariantStock);
router.delete("/:productId/variant", adminAuth, deleteVariant);

export default router;