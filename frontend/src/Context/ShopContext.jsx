// src/Context/ShopContext.jsx
import { createContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
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

const readPersistedAuth = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      readCookieToken() || null;
    const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);
    return { token, expiresAt };
  } catch {
    return { token: null, expiresAt: 0 };
  }
};

const now = () => Date.now();

const ShopContextProvider = ({ children }) => {
  const currency = "R$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // ------------------ auth ------------------
  const persisted = readPersistedAuth();
  const [token, _setToken] = useState(() => {
    // invalida se já expirou
    if (persisted.token && persisted.expiresAt && persisted.expiresAt > now()) {
      return persisted.token;
    }
    return null;
  });
  const [expiresAt, setExpiresAt] = useState(() => {
    return token ? persisted.expiresAt : 0;
  });
  const [user, setUser] = useState(null);
  const isLoggedIn = !!(token && expiresAt && expiresAt > now());
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleAutoLogout = useCallback((expiryMs) => {
    clearLogoutTimer();
    const msLeft = Math.max(0, expiryMs - now());
    if (msLeft === 0) return;
    logoutTimerRef.current = setTimeout(() => {
      toast.info("Sua sessão expirou. Faça login novamente.");
      setToken(null); // dispara limpeza total
      // redireciono aqui só se a página for protegida via ProtectedRoute
      // a navegação pro /login acontecerá pelo ProtectedRoute ou por quem chamar
      window.location.href = "/login";
    }, msLeft);
  }, []);

  const persistAuth = (t, exp) => {
    try {
      if (t && exp) {
        localStorage.setItem("token", t);
        localStorage.setItem("token_expires_at", String(exp));
        document.cookie = `token=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token_expires_at");
        document.cookie = "token=; Max-Age=0; path=/";
      }
    } catch {}
  };

  const setToken = useCallback((t, options = {}) => {
    // Por padrão, TTL 1h = 3600000ms (pode vir do backend também)
    const ttlMs = options.ttlMs ?? 3600000; // 1 hora
    const exp = t ? now() + ttlMs : 0;

    _setToken(t || null);
    setExpiresAt(exp);
    persistAuth(t, exp);

    if (t) scheduleAutoLogout(exp);
    else clearLogoutTimer();
  }, [scheduleAutoLogout]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  // Invalida sessão se já vier expirada ao montar
  useEffect(() => {
    if (persisted.token && (!persisted.expiresAt || persisted.expiresAt <= now())) {
      logout();
    } else if (persisted.token) {
      scheduleAutoLogout(persisted.expiresAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // request: injeta token
    instance.interceptors.request.use((config) => {
      if (token && expiresAt && expiresAt > now()) {
        config.headers = config.headers || {};
        config.headers.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // response: QUEREMOS que QUALQUER ERRO peça login novamente
    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        const serverMsg = error?.response?.data?.message || "";

        // considera expirado ou inválido
        const tokenExpiredLike =
          status === 401 ||
          status === 419 ||
          status === 498 ||
          /expired|invalid|jwt|token/i.test(serverMsg);

        // ou qualquer outro erro => pedir login novamente (conforme seu pedido)
        const anyError = true;

        if (anyError) {
          // se já expirou ou qualquer falha, força logout/redirect
          logout();
          toast.error("Sua sessão não é válida. Faça login novamente.");
          // redireciona imediatamente
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl, token, expiresAt, logout]);

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
    if (!isLoggedIn) return setFavorites([]);
    try {
      const { data } = await api.get("/api/user/favorites");
      if (data?.success) setFavorites(data.items || []);
    } catch (e) {/* silencioso */}
  }, [api, isLoggedIn]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => (p?._id || p) === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productOrId) => {
      if (!isLoggedIn) {
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
    [api, isLoggedIn, handleAxiosError]
  );

  // ===== ENDEREÇO =====
  const loadAddress = useCallback(async () => {
    if (!isLoggedIn) return setAddress(null);
    try {
      const { data } = await api.get("/api/user/address");
      if (data?.success) setAddress(data.address || null);
    } catch { /* ignore */ }
  }, [api, isLoggedIn]);

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

  useEffect(() => { loadFavorites(); loadAddress(); }, [isLoggedIn, loadFavorites, loadAddress]);

  const value = {
    products, setProducts, refreshProducts,
    currency, backendUrl,
    search, setSearch, showSearch, setShowSearch,
    token, setToken, user, setUser, isLoggedIn, logout, api, expiresAt,
    favorites, isFavorite, toggleFavorite, loadFavorites,
    address, saveAddress, loadAddress,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
