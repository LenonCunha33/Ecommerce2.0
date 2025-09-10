// backend/config/mongodb.js
import mongoose from "mongoose";

const { MONGODB_URI, MONGODB_DB } = process.env;

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

// cache p/ serverless (Vercel)
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error("MONGODB_URI não configurado");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB || "e-commerce", // 👉 define o DB aqui (NÃO concatene na URL)
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        retryWrites: true
      })
      .then((m) => {
        console.log("[DB] conectado");
        return m;
      })
      .catch((e) => {
        console.error("[DB] falha ao conectar:", e?.message);
        throw e;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
