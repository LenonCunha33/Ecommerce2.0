import express from "express";
import {
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
  deleteForOwner,   // << importar o novo handler
  adminSend,
  adminList,
  adminDelete,
  adminUpdate,
} from "../controllers/notificationController.js";

const router = express.Router();

// Cliente (sem middleware): usa token OU ?userId=... OU header x-user-id
router.get("/", listForUser);
router.get("/unread-count", unreadCount);
router.patch("/:id/read", markRead);
router.patch("/read-all", markAllRead);
router.delete("/:id", deleteForOwner); // << remover pelo próprio usuário

// Dashboard local (sem auth)
router.post("/admin/send", adminSend);
router.get("/admin/list", adminList);
router.patch("/admin/:id", adminUpdate);
router.delete("/admin/:id", adminDelete);

export default router;
