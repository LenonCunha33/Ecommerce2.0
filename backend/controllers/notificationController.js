import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const isOid = (id) => mongoose.Types.ObjectId.isValid(id);
const oid = (id) => new mongoose.Types.ObjectId(id);

const getBearer = (req) => {
  const h = req.headers?.authorization || "";
  if (/^Bearer\s+/i.test(h)) return h.split(" ")[1];
  return null;
};

const getUserIdFromReq = (req) => {
  // 1) se algum middleware setou
  if (req.userId && isOid(req.userId)) return req.userId;

  // 2) header/query/body
  const hdrUid = req.headers?.["x-user-id"];
  const qryUid = req.query?.userId;
  const bodyUid = req.body?.userId;
  const candidate = hdrUid || qryUid || bodyUid;
  if (candidate && isOid(candidate)) return candidate;

  // 3) token (Authorization/Bearer | header token | cookie token)
  const tok = getBearer(req) || req.headers?.token || req.cookies?.token;
  if (tok) {
    try {
      const dec = jwt.verify(tok, process.env.JWT_SECRET);
      const id = dec?.userId || dec?.id || dec?._id;
      if (id && isOid(id)) return id;
    } catch (_) {}
  }
  return null;
};

/* ====================== CLIENTE ====================== */
export const listForUser = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "NO_USER",
        message: "userId ausente. Envie em x-user-id, ?userId, body.userId ou token.",
      });
    }
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ readAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "product", model: Product, select: "name image price" })
        .lean(),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, readAt: null }),
    ]);

    return res.json({ success: true, items, total, unread, page, limit });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao carregar notificações." });
  }
};

export const unreadCount = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "NO_USER",
        message: "userId ausente. Envie em x-user-id, ?userId, body.userId ou token.",
      });
    }
    const count = await Notification.countDocuments({ user: userId, readAt: null });
    return res.json({ success: true, count });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao contar notificações." });
  }
};

export const markRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "NO_USER",
        message: "userId ausente. Envie em x-user-id, ?userId, body.userId ou token.",
      });
    }
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const n = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!n) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true, item: n });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao atualizar notificação." });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "NO_USER",
        message: "userId ausente. Envie em x-user-id, ?userId, body.userId ou token.",
      });
    }
    await Notification.updateMany({ user: userId, readAt: null }, { $set: { readAt: new Date() } });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao marcar todas como lidas." });
  }
};

/** Remover uma notificação do próprio usuário (exposta para o frontend) */
export const deleteForOwner = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "NO_USER",
        message: "userId ausente. Envie em x-user-id, ?userId, body.userId ou token.",
      });
    }
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const del = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!del) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao excluir notificação." });
  }
};

/* ====================== ADMIN (SEM AUTH) ====================== */
export const adminSend = async (req, res) => {
  try {
    const { title, body, type, icon, link, productId, target, userIds } = req.body || {};
    if (!title || !body) return res.status(400).json({ success: false, message: "Título e corpo são obrigatórios." });

    let ids = [];
    if (target === "all") {
      const users = await User.find({}).select("_id").lean();
      ids = users.map((u) => u._id);
    } else if (Array.isArray(userIds) && userIds.length) {
      ids = userIds.filter(isOid).map(oid);
    } else {
      return res.status(400).json({ success: false, message: "Defina o alvo (all ou users[])." });
    }

    const product = productId && isOid(productId) ? oid(productId) : null;
    if (!ids.length) return res.status(400).json({ success: false, message: "Sem destinatários." });

    const docs = ids.map((uid) => ({
      user: uid,
      sender: "Marima Oficial",
      title: String(title).trim(),
      body: String(body).trim(),
      type: type || "tip",
      icon: icon || "lightbulb",
      link: link || "",
      product,
    }));

    const created = await Notification.insertMany(docs, { ordered: false });
    return res.status(201).json({ success: true, created: created.length });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao enviar notificações." });
  }
};

export const adminList = async (_req, res) => {
  try {
    const items = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({ path: "user", model: User, select: "name email" })
      .populate({ path: "product", model: Product, select: "name" })
      .lean();
    return res.json({ success: true, items });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao listar notificações." });
  }
};

export const adminDelete = async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });
    const del = await Notification.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ success: false, message: "Notificação não encontrada." });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao excluir notificação." });
  }
};

export const adminUpdate = async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const { title, body, type, icon, link, productId, markUnread, markRead } = req.body || {};
    const set = {};
    if (typeof title === "string") set.title = title.trim();
    if (typeof body === "string") set.body = body.trim();
    if (typeof type === "string") set.type = type;
    if (typeof icon === "string") set.icon = icon;
    if (typeof link === "string") set.link = link;
    if (productId !== undefined) set.product = (productId && isOid(productId)) ? oid(productId) : null;
    if (markUnread === true) set.readAt = null;
    if (markRead === true) set.readAt = new Date();

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ success: false, message: "Nada para atualizar." });
    }

    const upd = await Notification.findByIdAndUpdate(id, { $set: set }, { new: true });
    if (!upd) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true, item: upd });
  } catch {
    return res.status(500).json({ success: false, message: "Erro ao atualizar notificação." });
  }
};
