import express from "express";
import multer from "multer";
import { contactForm } from "../controllers/contactController.js";

const router = express.Router();

// salvar arquivos temporariamente
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), contactForm);

export default router;
