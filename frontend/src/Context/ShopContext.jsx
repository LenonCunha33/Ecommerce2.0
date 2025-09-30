// src/Context/ShopContext.jsx
import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const readCookieToken = () => {
  try {
    if (typeof document === "undefined") return null;
    const m = (document.cookie || "").match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
};

const ShopContextProvider = ({ children }) => {
  const currency = "R$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // ------------------ auth ------------------
  const [token, _setToken] = useState(() => {
    try {
      return localStorage.getItem("token") ||
             localStorage.getItem("authToken") ||
             readCookieToken() || null;
    } catch { return null; }
  });
  const [user, setUser] = useState(null);
  const isLoggedIn = !!(token || user);

  const setToken = useCallback((t) => {
    _setToken(t || null);
    try {
      if (t) {
        localStorage.setItem("token", t);
        document.cookie = `token=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        document.cookie = "token=; Max-Age=0; path=/";
      }
    } catch {}
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, [setToken]);

  // ------------------ catálogo / ui ------------------
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);

  // favoritos & endereço
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState(null);

  // Axios com headers compatíveis com o backend
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: backendUrl, timeout: 20000 });
    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers || {};
        // compatibilidade total com o middleware
        config.headers.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, [backendUrl, token]);

  const handleAxiosError = useCallback((error, fallbackMsg = "Ocorreu um erro.") => {
    console.error("[API ERRO]", error?.response?.status, error?.response?.data || error?.message);
    const msg = error?.response?.data?.message || fallbackMsg;
    if (!navigator.onLine) return toast.error("Sem conexão com a internet.");
    toast.error(msg);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data?.success) setProducts(data.products || []);
      else toast.error(data?.message || "Não foi possível carregar os produtos.");
    } catch (e) { handleAxiosError(e, "Não foi possível carregar os produtos."); }
  }, [api, handleAxiosError]);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  // ===== FAVORITOS =====
  const loadFavorites = useCallback(async () => {
    if (!token) return setFavorites([]);
    try {
      const { data } = await api.get("/api/user/favorites");
      if (data?.success) setFavorites(data.items || []);
    } catch (e) {
      // silencioso para não poluir a UI
    }
  }, [api, token]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => (p?._id || p) === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productOrId) => {
      if (!token) {
        toast.info("Faça login para salvar favoritos.");
        return (window.location.href = "/login");
      }
      const productId = typeof productOrId === "string" ? productOrId : productOrId?._id;
      if (!productId) return;

      try {
        const { data } = await api.post("/api/user/favorites/toggle", { productId });
        if (data?.success) setFavorites(data.items || []);
      } catch (e) {
        handleAxiosError(e, "Erro ao atualizar favorito.");
      }
    },
    [api, token, handleAxiosError]
  );

  // ===== ENDEREÇO =====
  const loadAddress = useCallback(async () => {
    if (!token) return setAddress(null);
    try {
      const { data } = await api.get("/api/user/address");
      if (data?.success) setAddress(data.address || null);
    } catch { /* ignore */ }
  }, [api, token]);

  const saveAddress = useCallback(async (form) => {
    try {
      const { data } = await api.put("/api/user/address", form);
      if (data?.success) {
        setAddress(data.address);
        toast.success("Endereço salvo!");
      }
      return data;
    } catch (e) {
      handleAxiosError(e, "Erro ao salvar endereço.");
      return { success: false };
    }
  }, [api, handleAxiosError]);

  useEffect(() => { loadFavorites(); loadAddress(); }, [token, loadFavorites, loadAddress]);

  // compra rápida
  const buyNow = (productId) => {
    const p = products.find((x) => x._id === productId);
    if (!p) return toast.error("Produto não encontrado.");
    if (p.yampiLinks && typeof p.yampiLinks === "object") {
      const entries = Object.entries(p.yampiLinks).filter(([_, url]) => typeof url === "string" && url.trim());
      if (entries.length === 1) return (window.location.href = entries[0][1]);
      return toast.info("Escolha o tamanho na página do produto.");
    }
    if (p.yampiLink) return (window.location.href = p.yampiLink);
    toast.error("Link de compra indisponível.");
  };

  const value = {
    products, setProducts, refreshProducts,
    currency, backendUrl,
    search, setSearch, showSearch, setShowSearch,
    buyNow,
    token, setToken, user, setUser, isLoggedIn, logout, api,
    favorites, isFavorite, toggleFavorite, loadFavorites,
    address, saveAddress, loadAddress,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
