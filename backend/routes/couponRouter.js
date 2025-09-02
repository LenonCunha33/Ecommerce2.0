// backend/routes/couponRouter.js
import express from "express";
import { validateCoupon } from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.post("/validate", validateCoupon);

export default couponRouter;
