// src/pages/List.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence, Reorder } from "framer-motion";

/* ---------- Utils ---------- */
const isHttp = (u) => /^https?:\/\//i.test(String(u || "").trim());
const isValidUrl = (u) => {
  if (!u) return false;
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
};
const shortUrl = (u) => {
  if (!isValidUrl(u)) return "";
  try {
    const { hostname, pathname } = new URL(u);
    const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "";
    return `${hostname}${p ? "…" : ""}`;
  } catch {
    return u;
  }
};

/** Normaliza qualquer valor vindo do backend para uma URL exibível */
const normalizeImageUrl = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (isHttp(s)) return s;
  if (s.startsWith("file://")) return null;
  if (s.startsWith("/uploads/")) {
    return `${backendUrl.replace(/\/$/, "")}${s}`;
  }
  const filename = s.split("/").pop();
  if (!filename) return null;
  return `${backendUrl.replace(/\/$/, "")}/uploads/${filename}`;
};

const keyOf = (productId, size) => `${productId}:${size}`;

/* ---------- Mini componentes visuais ---------- */
const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
    {children}
  </h3>
);

const FieldLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const Pill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
      active
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

/* ---------- Componente principal ---------- */
const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    subCategory: "", // <-- adicionado
    price: "",
  });

  // Descrição
  const [descDraft, setDescDraft] = useState({}); // {productId: string}

  // Variantes
  const [rowEdit, setRowEdit] = useState({});
  const [newVarForm, setNewVarForm] = useState({});

  // Links por tamanho (cache/rascunho)
  // linkEdits: { productId: { [size]: url } }
  const [linkEdits, setLinkEdits] = useState({});
  // edição inline por linha da tabela de tamanhos
  // linkRowEdit: { "pid:size": string }
  const [linkRowEdit, setLinkRowEdit] = useState({});

  // Imagens (mini-dashboard)
  const [imageBoards, setImageBoards] = useState({});
  const filePickersRef = useRef({});
  const MAX_IMAGES = 4;

  const authHeaders = useMemo(() => ({ headers: { token } }), [token]);

  const buscarLista = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/product/list`,
        authHeaders
      );
      if (data?.success) {
        const products = data.products || [];
        setList(products);

        // drafts que dependem do produto
        const nextDesc = {};
        const nextBoards = {};
        const nextLinks = {};
        for (const p of products) {
          nextDesc[p._id] = p.description || "";

          const imgs = (p.image || [])
            .map(normalizeImageUrl)
            .filter(Boolean)
            .slice(0, MAX_IMAGES);
          nextBoards[p._id] = imgs.map((src, idx) => ({
            id: `${p._id}:${idx}`,
            src,
            isNew: false,
          }));

          const rawLinks =
            p && typeof p.yampiLinks === "object" && p.yampiLinks !== null
              ? p.yampiLinks
              : {};
          nextLinks[p._id] = { ...rawLinks };
        }
        setDescDraft(nextDesc);
        setImageBoards(nextBoards);
        setLinkEdits(nextLinks);
      } else {
        toast.error(data?.message || "Falha ao carregar produtos.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao buscar produtos."
      );
    }
  };

  useEffect(() => {
    buscarLista();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Básico ---------- */
  const salvarEdicaoBasica = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        { ...editData }, // já inclui subCategory
        authHeaders
      );
      if (data?.success) {
        toast.success("Produto atualizado!");
        setEditId(null);
        buscarLista();
      } else {
        toast.error(data?.message || "Não foi possível atualizar.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar produto."
      );
    }
  };

  const toggleVisibility = async (id, visible) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/product/toggle-visibility`,
        { id, visible },
        authHeaders
      );
      if (data?.success) buscarLista();
      else toast.error(data?.message || "Não foi possível alterar visibilidade.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao alterar visibilidade."
      );
    }
  };

  const removerProduto = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        authHeaders
      );
      if (data?.success) {
        toast.success(data?.message || "Produto removido!");
        buscarLista();
      } else {
        toast.error(data?.message || "Não foi possível remover.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao remover produto."
      );
    }
  };

  /* ---------- Descrição ---------- */
  const salvarDescricao = async (id) => {
    const description = descDraft[id] ?? "";
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        { description },
        authHeaders
      );
      if (data?.success) {
        toast.success("Descrição salva!");
        buscarLista();
      } else {
        toast.error(data?.message || "Não foi possível salvar a descrição.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao salvar descrição."
      );
    }
  };

  /* ---------- Links (Yampi) ---------- */
  const handleLinkChange = (productId, size, url) => {
    setLinkEdits((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [size]: url },
    }));
  };

  // salva todos os links editáveis do produto
  const salvarLinks = async (productId, sizes) => {
    try {
      const raw = linkEdits[productId] || {};
      const cleaned = {};
      for (const s of Object.keys(raw)) {
        const url = String(raw[s] || "").trim();
        if (url) {
          if (!isValidUrl(url)) {
            toast.error(`URL inválida para o tamanho ${s}.`);
            return;
          }
          cleaned[s] = url;
        }
      }

      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${productId}`,
        { yampiLinks: cleaned },
        authHeaders
      );

      if (data?.success) {
        // cache local atualizado sem recarregar
        setLinkEdits((prev) => ({ ...prev, [productId]: cleaned }));
        toast.success("Links salvos!");
      } else {
        toast.error(data?.message || "Não foi possível salvar os links.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao salvar links.");
    }
  };

  // edição inline por tamanho (na tabela de tamanhos)
  const startLinkRowEdit = (pid, size) => {
    const key = keyOf(pid, size);
    const current = (linkEdits[pid] || {})[size] || "";
    setLinkRowEdit((prev) => ({ ...prev, [key]: current }));
  };
  const cancelLinkRowEdit = (pid, size) => {
    const key = keyOf(pid, size);
    setLinkRowEdit((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };
  const saveLinkRowEdit = async (pid, size) => {
    const key = keyOf(pid, size);
    const url = String(linkRowEdit[key] || "").trim();

    if (url && !isValidUrl(url)) {
      toast.error(`URL inválida para o tamanho ${size}.`);
      return;
    }

    // monta objeto completo atualizando só esse size
    const current = linkEdits[pid] || {};
    const next = { ...current };
    if (url) next[size] = url;
    else delete next[size];

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${pid}`,
        { yampiLinks: next },
        authHeaders
      );
      if (data?.success) {
        setLinkEdits((prev) => ({ ...prev, [pid]: next }));
        cancelLinkRowEdit(pid, size);
        toast.success("Link salvo!");
      } else {
        toast.error(data?.message || "Falha ao salvar link.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao salvar link.");
    }
  };

  /* ---------- Variantes (size/SKU/ativo) ---------- */
  const startRowEdit = (productId, v) => {
    setRowEdit((prev) => ({
      ...prev,
      [keyOf(productId, v.size)]: {
        size: v.size,
        sku: v.sku || "",
        isActive: !!v.isActive,
      },
    }));
  };

  const cancelRowEdit = (productId, size) => {
    setRowEdit((prev) => {
      const next = { ...prev };
      delete next[keyOf(productId, size)];
      return next;
    });
  };

  const handleRowEditChange = (productId, size, field, value) => {
    const k = keyOf(productId, size);
    setRowEdit((prev) => ({
      ...prev,
      [k]: { ...(prev[k] || {}), [field]: value },
    }));
  };

  const saveRowEdit = async (productId, originalSize) => {
    const k = keyOf(productId, originalSize);
    const dataRow = rowEdit[k];
    if (!dataRow) return;

    const payload = {
      originalSize,
      size: (dataRow.size || "").trim(),
      sku: (dataRow.sku || "").trim(),
      isActive: !!dataRow.isActive,
    };

    if (!payload.size) {
      toast.error("O tamanho não pode ficar vazio.");
      return;
    }

    try {
      await axios.put(
        `${backendUrl}/api/product/${productId}/variant/upsert`,
        payload,
        authHeaders
      );
      toast.success("Tamanho/SKU atualizado!");
      cancelRowEdit(productId, originalSize);
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar tamanho."
      );
    }
  };

  const toggleVariantActive = async (productId, size, isActive) => {
    try {
      await axios.patch(
        `${backendUrl}/api/product/${productId}/variant/toggle`,
        { size, isActive },
        authHeaders
      );
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao alterar disponibilidade do tamanho."
      );
    }
  };

  const createVariant = async (productId) => {
    const form = newVarForm[productId] || {};
    const size = (form.size || "").trim();
    const sku = (form.sku || "").trim();
    const isActive = !!form.isActive;

    if (!size) return toast.error("Informe o tamanho (ex.: P, M, G).");

    try {
      await axios.put(
        `${backendUrl}/api/product/${productId}/variant/upsert`,
        { size, sku, isActive },
        authHeaders
      );
      toast.success("Tamanho adicionado/atualizado!");
      setNewVarForm((prev) => ({
        ...prev,
        [productId]: { size: "", sku: "", isActive: true },
      }));
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao salvar tamanho."
      );
    }
  };

  const deleteVariant = async (productId, size) => {
    if (!window.confirm(`Remover o tamanho "${size}" deste produto?`)) return;
    try {
      await axios.delete(
        `${backendUrl}/api/product/${productId}/variant`,
        {
          data: { size },
          ...authHeaders,
        }
      );
      toast.success("Tamanho removido!");
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao remover tamanho."
      );
    }
  };

  /* ---------- Imagens ---------- */
  const openFilePicker = (pid) => {
    if (!filePickersRef.current[pid]) return;
    filePickersRef.current[pid].click();
  };

  const handleAddImages = (pid, files) => {
    if (!files?.length) return;
    setImageBoards((prev) => {
      const current = prev[pid] || [];
      const remainingSlots = MAX_IMAGES - current.length;
      const selected = Array.from(files).slice(0, Math.max(0, remainingSlots));
      const toAdd = selected.map((file, idx) => ({
        id: `${pid}:new:${Date.now()}:${idx}`,
        file,
        isNew: true,
      }));
      return { ...prev, [pid]: [...current, ...toAdd] };
    });
  };

  const removeImage = (pid, id) => {
    setImageBoards((prev) => {
      const next = (prev[pid] || []).filter((img) => img.id !== id);
      return { ...prev, [pid]: next };
    });
  };

  const moveToFirst = (pid, id) => {
    setImageBoards((prev) => {
      const arr = [...(prev[pid] || [])];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx > -1) {
        const [item] = arr.splice(idx, 1);
        arr.unshift(item);
      }
      return { ...prev, [pid]: arr };
    });
  };

  const moveToLast = (pid, id) => {
    setImageBoards((prev) => {
      const arr = [...(prev[pid] || [])];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx > -1) {
        const [item] = arr.splice(idx, 1);
        arr.push(item);
      }
      return { ...prev, [pid]: arr };
    });
  };

  const onReorder = (pid, newOrder) => {
    setImageBoards((prev) => ({ ...prev, [pid]: newOrder }));
  };

  const salvarImagens = async (pid) => {
    try {
      const board = imageBoards[pid] || [];
      if (board.length === 0) {
        const fd = new FormData();
        fd.append("keepImages", JSON.stringify([]));
        const { data } = await axios.put(
          `${backendUrl}/api/product/update/${pid}`,
          fd,
          {
            headers: { token, "Content-Type": "multipart/form-data" },
          }
        );
        if (data?.success) {
          toast.success("Imagens atualizadas!");
          buscarLista();
        } else {
          toast.error(data?.message || "Falha ao atualizar imagens.");
        }
        return;
      }

      const keepImages = [];
      const newFiles = [];
      for (const item of board) {
        if (item.isNew) newFiles.push(item.file);
        else if (item.src && isHttp(item.src)) keepImages.push(item.src);
      }

      const fd = new FormData();
      fd.append("keepImages", JSON.stringify(keepImages));
      newFiles.forEach((file, idx) => {
        fd.append(`image${idx + 1}`, file);
      });

      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${pid}`,
        fd,
        {
          headers: { token, "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        toast.success("Imagens atualizadas!");
        buscarLista();
      } else {
        toast.error(data?.message || "Falha ao atualizar imagens.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar imagens."
      );
    }
  };

  /* ---------- UI ---------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, ease: "easeOut" } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <section
      className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto"
      aria-labelledby="product-list-title"
    >
      <motion.h1
        id="product-list-title"
        className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Catálogo • Mini-Dashboard por Produto
      </motion.h1>

      <p className="text-gray-600 mb-6">
        Gerencie{" "}
        <strong>conteúdo, imagens, descrição, tamanhos e links</strong> de cada
        produto — tudo em um só lugar.
      </p>

      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Cabeçalho da lista */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_0.8fr_1.2fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Subcategoria</span>
          <span>Preço</span>
          <span>Visível</span>
          <span className="text-center">Ações</span>
        </div>

        {list.map((product) => {
          const isExpanded = !!expanded[product._id];
          const variants = Array.isArray(product.variants)
            ? product.variants
            : [];
          const board = imageBoards[product._id] || [];
          const coverSrc = normalizeImageUrl(product.image?.[0]);
          const sizes = Array.isArray(product.sizes) ? product.sizes : [];
          const linksDraft = linkEdits[product._id] || {};
          const validLinksCount = Object.values(linksDraft).filter(isValidUrl)
            .length;

          return (
            <motion.div
              key={product._id}
              variants={itemVariants}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Linha compacta */}
              <div className="grid grid-cols-1 gap-4 px-4 py-4 text-sm sm:text-base text-gray-700 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_0.8fr_1.2fr]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border shadow-sm overflow-hidden bg-gray-50">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={`Imagem do produto ${product.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      Sem imagem
                    </div>
                  )}
                </div>

                {editId === product._id ? (
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <button
                    className="truncate font-medium text-gray-900 text-left hover:underline"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [product._id]: !isExpanded,
                      }))
                    }
                    title="Abrir mini-dashboard"
                  >
                    {product.name}
                  </button>
                )}

                {editId === product._id ? (
                  <input
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <p className="text-gray-600">{product.category}</p>
                )}

                {editId === product._id ? (
                  <select
                    value={editData.subCategory}
                    onChange={(e) =>
                      setEditData({ ...editData, subCategory: e.target.value })
                    }
                    className="px-2 py-1 border rounded w-full"
                  >
                    <option value="Topwear">Parte Superior</option>
                    <option value="Bottomwear">Parte Inferior</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{product.subCategory}</p>
                )}

                {editId === product._id ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">
                    {currency}
                    {product.price}
                  </p>
                )}

                <motion.button
                  onClick={() => toggleVisibility(product._id, !product.visible)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className={`w-5 h-5 rounded-full mx-auto transition-colors duration-200 ${
                    product.visible
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                  aria-label={
                    product.visible
                      ? "Produto visível no catálogo"
                      : "Produto oculto no catálogo"
                  }
                />

                <div className="flex justify-start sm:justify-end md:justify-center gap-2">
                  {editId === product._id ? (
                    <motion.button
                      onClick={() => salvarEdicaoBasica(product._id)}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-semibold transition"
                      title="Salvar básicas"
                    >
                      ✔
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setEditId(product._id);
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                        });
                      }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                      title="Editar nome/categoria/preço"
                    >
                      ✎
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Tem certeza que deseja remover este produto? Essa ação não poderá ser desfeita."
                        )
                      ) {
                        removerProduto(product._id);
                      }
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                    title="Remover"
                  >
                    ✕
                  </motion.button>

                  <motion.button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [product._id]: !isExpanded,
                      }))
                    }
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition"
                    title="Abrir mini-dashboard"
                  >
                    {isExpanded ? "Fechar" : "Abrir"}
                  </motion.button>
                </div>
              </div>

              {/* Mini-dashboard */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-6"
                  >
                    <div className="grid lg:grid-cols-12 gap-6">
                      {/* COL A: Básico + Descrição */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                          <SectionTitle>Conteúdo Básico</SectionTitle>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <FieldLabel htmlFor={`nm-${product._id}`}>
                                Nome
                              </FieldLabel>
                              <input
                                id={`nm-${product._id}`}
                                className="w-full px-3 py-2 border rounded"
                                value={
                                  editId === product._id
                                    ? editData.name
                                    : product.name
                                }
                                onChange={(e) =>
                                  editId === product._id
                                    ? setEditData((d) => ({
                                        ...d,
                                        name: e.target.value,
                                      }))
                                    : setEditId(product._id) ||
                                      setEditData({
                                        name: e.target.value,
                                        category: product.category,
                                        subCategory:
                                          product.subCategory || "Topwear",
                                        price: product.price,
                                      })
                                }
                              />
                            </div>

                            <div>
                              <FieldLabel htmlFor={`ct-${product._id}`}>
                                Categoria
                              </FieldLabel>
                              <input
                                id={`ct-${product._id}`}
                                className="w-full px-3 py-2 border rounded"
                                value={
                                  editId === product._id
                                    ? editData.category
                                    : product.category
                                }
                                onChange={(e) =>
                                  editId === product._id
                                    ? setEditData((d) => ({
                                        ...d,
                                        category: e.target.value,
                                      }))
                                    : setEditId(product._id) ||
                                      setEditData({
                                        name: product.name,
                                        category: e.target.value,
                                        subCategory:
                                          product.subCategory || "Topwear",
                                        price: product.price,
                                      })
                                }
                              />
                            </div>

                            <div>
                              <FieldLabel htmlFor={`sct-${product._id}`}>
                                Subcategoria
                              </FieldLabel>
                              <select
                                id={`sct-${product._id}`}
                                className="w-full px-3 py-2 border rounded"
                                value={
                                  editId === product._id
                                    ? editData.subCategory
                                    : product.subCategory || "Topwear"
                                }
                                onChange={(e) =>
                                  editId === product._id
                                    ? setEditData((d) => ({
                                        ...d,
                                        subCategory: e.target.value,
                                      }))
                                    : setEditId(product._id) ||
                                      setEditData({
                                        name: product.name,
                                        category: product.category,
                                        subCategory: e.target.value,
                                        price: product.price,
                                      })
                                }
                              >
                                <option value="Topwear">Parte Superior</option>
                                <option value="Bottomwear">Parte Inferior</option>
                              </select>
                            </div>

                            <div>
                              <FieldLabel htmlFor={`pr-${product._id}`}>
                                Preço
                              </FieldLabel>
                              <input
                                id={`pr-${product._id}`}
                                type="number"
                                className="w-full px-3 py-2 border rounded"
                                value={
                                  editId === product._id
                                    ? editData.price
                                    : product.price
                                }
                                onChange={(e) =>
                                  editId === product._id
                                    ? setEditData((d) => ({
                                        ...d,
                                        price: e.target.value,
                                      }))
                                    : setEditId(product._id) ||
                                      setEditData({
                                        name: product.name,
                                        category: product.category,
                                        subCategory:
                                          product.subCategory || "Topwear",
                                        price: e.target.value,
                                      })
                                }
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                onClick={() => salvarEdicaoBasica(product._id)}
                                className="w-full sm:w-auto mt-1 px-4 py-2 rounded bg-black text-white hover:opacity-90"
                              >
                                Salvar básicos
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                          <SectionTitle>Descrição</SectionTitle>
                          <textarea
                            className="mt-3 w-full min-h-28 px-3 py-2 border rounded resize-y"
                            value={descDraft[product._id] ?? ""}
                            onChange={(e) =>
                              setDescDraft((prev) => ({
                                ...prev,
                                [product._id]: e.target.value,
                              }))
                            }
                            placeholder="Texto de descrição do produto…"
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Dica: descreva tecido, elasticidade, caimento e
                              uso.
                            </span>
                            <button
                              onClick={() => salvarDescricao(product._id)}
                              className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
                            >
                              Salvar descrição
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* COL B: Imagens + Tabelas */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Imagens */}
                        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <SectionTitle>
                              Imagens (ordem define a principal)
                            </SectionTitle>
                            <div className="flex items-center gap-2">
                              <Pill active>
                                {board.length}/{MAX_IMAGES}
                              </Pill>
                              <input
                                ref={(el) =>
                                  (filePickersRef.current[product._id] = el)
                                }
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => {
                                  handleAddImages(
                                    product._id,
                                    e.target.files
                                  );
                                  e.target.value = "";
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => openFilePicker(product._id)}
                                className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm"
                                disabled={board.length >= MAX_IMAGES}
                                title={
                                  board.length >= MAX_IMAGES
                                    ? "Limite de imagens atingido"
                                    : "Adicionar imagens"
                                }
                              >
                                + Adicionar
                              </button>
                              <button
                                type="button"
                                onClick={() => salvarImagens(product._id)}
                                className="px-3 py-1.5 rounded-md bg-black text-white hover:opacity-90 text-sm"
                              >
                                Salvar imagens
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            Arraste para reordenar. Use as ações para definir{" "}
                            <strong>primeira</strong> ou <strong>última</strong>
                            , ou remover.
                          </p>

                          <Reorder.Group
                            axis="x"
                            values={board}
                            onReorder={(vals) =>
                              onReorder(product._id, vals.slice(0, MAX_IMAGES))
                            }
                            className="mt-4 flex gap-3 overflow-x-auto pb-2"
                          >
                            {board.map((item, idx) => (
                              <Reorder.Item key={item.id} value={item}>
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm bg-gray-50">
                                  {item.src ? (
                                    <img
                                      src={item.src}
                                      alt={`Imagem ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={URL.createObjectURL(item.file)}
                                      alt="Nova imagem"
                                      className="w-full h-full object-cover"
                                    />
                                  )}

                                  <div className="absolute top-1 left-1">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        idx === 0
                                          ? "bg-emerald-600 text-white"
                                          : "bg-white/90 text-gray-700 border"
                                      }`}
                                    >
                                      {idx === 0 ? "PRINCIPAL" : `#${idx + 1}`}
                                    </span>
                                  </div>

                                  <div className="absolute bottom-1 inset-x-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveToFirst(product._id, item.id)
                                      }
                                      className="flex-1 text-[11px] px-2 py-1 rounded bg-white/95 hover:bg-white border"
                                      title="Definir como primeira"
                                    >
                                      1ª
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveToLast(product._id, item.id)
                                      }
                                      className="flex-1 text-[11px] px-2 py-1 rounded bg-white/95 hover:bg-white border"
                                      title="Mover para última"
                                    >
                                      Últ.
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeImage(product._id, item.id)
                                      }
                                      className="flex-1 text-[11px] px-2 py-1 rounded bg-red-50 hover:bg-red-100 border text-red-700"
                                      title="Remover"
                                    >
                                      Rem.
                                    </button>
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>

                        {/* Tamanhos / SKU / Link (inline) */}
                        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <SectionTitle>Tamanhos, SKU & Link</SectionTitle>
                            <span className="text-xs text-gray-500">
                              Ative/desative, edite SKU e o link do tamanho
                            </span>
                          </div>

                          <div className="overflow-x-auto mt-3">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                  <th className="text-left px-2 py-2">
                                    Tamanho
                                  </th>
                                  <th className="text-left px-2 py-2">SKU</th>
                                  <th className="text-left px-2 py-2">
                                    Link (Yampi)
                                  </th>
                                  <th className="text-center px-2 py-2">
                                    Ativo
                                  </th>
                                  <th className="text-center px-2 py-2">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {variants.length === 0 && (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-2 py-4 text-center text-gray-500"
                                    >
                                      Nenhum tamanho cadastrado ainda.
                                    </td>
                                  </tr>
                                )}

                                {variants.map((v) => {
                                  const k = keyOf(product._id, v.size);
                                  const isRowEditing = !!rowEdit[k];

                                  // link inline
                                  const lkKey = keyOf(product._id, v.size);
                                  const isLinkEditing =
                                    typeof linkRowEdit[lkKey] !== "undefined";
                                  const savedLink =
                                    (linksDraft || {})[v.size] || "";

                                  return (
                                    <tr key={k} className="border-b last:border-b-0">
                                      {/* Tamanho */}
                                      <td className="px-2 py-2">
                                        {isRowEditing ? (
                                          <input
                                            className="px-2 py-1 border rounded w-24"
                                            value={rowEdit[k].size}
                                            onChange={(e) =>
                                              handleRowEditChange(
                                                product._id,
                                                v.size,
                                                "size",
                                                e.target.value
                                              )
                                            }
                                          />
                                        ) : (
                                          <span className="font-medium text-gray-900">
                                            {v.size}
                                          </span>
                                        )}
                                      </td>

                                      {/* SKU */}
                                      <td className="px-2 py-2">
                                        {isRowEditing ? (
                                          <input
                                            className="px-2 py-1 border rounded w-36"
                                            placeholder="SKU (opcional)"
                                            value={rowEdit[k].sku}
                                            onChange={(e) =>
                                              handleRowEditChange(
                                                product._id,
                                                v.size,
                                                "sku",
                                                e.target.value
                                              )
                                            }
                                          />
                                        ) : (
                                          <span className="text-gray-700">
                                            {v.sku || "—"}
                                          </span>
                                        )}
                                      </td>

                                      {/* Link (inline) */}
                                      <td className="px-2 py-2">
                                        {isLinkEditing ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              className="px-2 py-1 border rounded w-full min-w-60"
                                              placeholder={`https://… link do ${v.size}`}
                                              value={linkRowEdit[lkKey] || ""}
                                              onChange={(e) =>
                                                setLinkRowEdit((prev) => ({
                                                  ...prev,
                                                  [lkKey]: e.target.value,
                                                }))
                                              }
                                            />
                                            <button
                                              onClick={() =>
                                                saveLinkRowEdit(
                                                  product._id,
                                                  v.size
                                                )
                                              }
                                              className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                                            >
                                              Salvar
                                            </button>
                                            <button
                                              onClick={() =>
                                                cancelLinkRowEdit(
                                                  product._id,
                                                  v.size
                                                )
                                              }
                                              className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        ) : savedLink ? (
                                          <div className="flex items-center gap-2">
                                            <a
                                              className="text-blue-600 hover:underline break-all"
                                              href={savedLink}
                                              target="_blank"
                                              rel="noreferrer"
                                              title={savedLink}
                                            >
                                              {shortUrl(savedLink)}
                                            </a>
                                            <button
                                              onClick={() =>
                                                startLinkRowEdit(
                                                  product._id,
                                                  v.size
                                                )
                                              }
                                              className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                                            >
                                              ✎
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              startLinkRowEdit(
                                                product._id,
                                                v.size
                                              )
                                            }
                                            className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
                                          >
                                            + adicionar link
                                          </button>
                                        )}
                                      </td>

                                      {/* Ativo */}
                                      <td className="px-2 py-2 text-center">
                                        <button
                                          onClick={() =>
                                            toggleVariantActive(
                                              product._id,
                                              v.size,
                                              !v.isActive
                                            )
                                          }
                                          className={`inline-block w-5 h-5 rounded-full transition-colors ${
                                            v.isActive
                                              ? "bg-green-500 hover:bg-green-600"
                                              : "bg-gray-400 hover:bg-gray-500"
                                          }`}
                                          aria-label={
                                            v.isActive
                                              ? "Tamanho ativo"
                                              : "Tamanho inativo"
                                          }
                                        />
                                      </td>

                                      {/* Ações de linha (tamanho/SKU) */}
                                      <td className="px-2 py-2 text-center">
                                        {isRowEditing ? (
                                          <div className="flex items-center justify-center gap-2">
                                            <button
                                              onClick={() =>
                                                saveRowEdit(product._id, v.size)
                                              }
                                              className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                                            >
                                              Salvar
                                            </button>
                                            <button
                                              onClick={() =>
                                                cancelRowEdit(product._id, v.size)
                                              }
                                              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-center gap-2">
                                            <button
                                              onClick={() =>
                                                startRowEdit(product._id, v)
                                              }
                                              className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                                            >
                                              ✎
                                            </button>
                                            <button
                                              onClick={() =>
                                                deleteVariant(
                                                  product._id,
                                                  v.size
                                                )
                                              }
                                              className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                                            >
                                              Remover
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}

                                {/* Nova variante */}
                                <tr className="bg-gray-50">
                                  <td className="px-2 py-3">
                                    <input
                                      className="px-2 py-1 border rounded w-24"
                                      placeholder="Tamanho (P/M/G)"
                                      value={newVarForm[product._id]?.size || ""}
                                      onChange={(e) =>
                                        setNewVarForm((prev) => ({
                                          ...prev,
                                          [product._id]: {
                                            ...(prev[product._id] || {}),
                                            size: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </td>
                                  <td className="px-2 py-3">
                                    <input
                                      className="px-2 py-1 border rounded w-36"
                                      placeholder="SKU (opcional)"
                                      value={newVarForm[product._id]?.sku || ""}
                                      onChange={(e) =>
                                        setNewVarForm((prev) => ({
                                          ...prev,
                                          [product._id]: {
                                            ...(prev[product._id] || {}),
                                            sku: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </td>
                                  <td className="px-2 py-3 text-gray-400 text-sm">
                                    (defina o link depois)
                                  </td>
                                  <td className="px-2 py-3 text-center">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={
                                          !!(newVarForm[product._id]?.isActive ??
                                          true)
                                        }
                                        onChange={(e) =>
                                          setNewVarForm((prev) => ({
                                            ...prev,
                                            [product._id]: {
                                              ...(prev[product._id] || {}),
                                              isActive: e.target.checked,
                                            },
                                          }))
                                        }
                                      />
                                      <span className="text-xs text-gray-700">
                                        Ativo
                                      </span>
                                    </label>
                                  </td>
                                  <td className="px-2 py-3 text-center">
                                    <button
                                      onClick={() => createVariant(product._id)}
                                      className="px-3 py-2 rounded bg-black text-white hover:opacity-90"
                                    >
                                      Adicionar tamanho
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Links (edição em massa) */}
                        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <SectionTitle>
                              Links de compra por tamanho (Yampi)
                            </SectionTitle>
                            <Pill active>
                              {validLinksCount}/{sizes.length}
                            </Pill>
                          </div>

                          <div className="overflow-x-auto mt-3">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                  <th className="text-left px-2 py-2">
                                    Tamanho
                                  </th>
                                  <th className="text-left px-2 py-2">Link</th>
                                  <th className="text-center px-2 py-2">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sizes.map((s) => {
                                  const val = linksDraft[s] || "";
                                  const ok = !val || isValidUrl(val);
                                  return (
                                    <tr key={`${product._id}-${s}`} className="border-b last:border-b-0">
                                      <td className="px-2 py-2 font-medium text-gray-900">
                                        {s}
                                      </td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="url"
                                          placeholder={`https://… link do ${s}`}
                                          value={val}
                                          onChange={(e) =>
                                            handleLinkChange(
                                              product._id,
                                              s,
                                              e.target.value
                                            )
                                          }
                                          className={`w-full px-2 py-1 border rounded ${
                                            ok ? "border-gray-300" : "border-red-400"
                                          }`}
                                        />
                                        {!!val && (
                                          <a
                                            href={val}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                                          >
                                            Abrir link
                                          </a>
                                        )}
                                      </td>
                                      <td className="px-2 py-2 text-center">
                                        <button
                                          onClick={() => {
                                            handleLinkChange(product._id, s, "");
                                          }}
                                          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                                        >
                                          Limpar
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {/* extras (se existir chave em yampiLinks que não esteja em sizes) */}
                                {Object.keys(linksDraft)
                                  .filter((k) => !sizes.includes(k))
                                  .map((extra) => {
                                    const val = linksDraft[extra] || "";
                                    const ok = !val || isValidUrl(val);
                                    return (
                                      <tr key={`${product._id}-extra-${extra}`} className="border-b last:border-b-0">
                                        <td className="px-2 py-2 font-medium text-gray-900">
                                          {extra}
                                        </td>
                                        <td className="px-2 py-2">
                                          <input
                                            type="url"
                                            value={val}
                                            onChange={(e) =>
                                              handleLinkChange(
                                                product._id,
                                                extra,
                                                e.target.value
                                              )
                                            }
                                            className={`w-full px-2 py-1 border rounded ${
                                              ok ? "border-gray-300" : "border-red-400"
                                            }`}
                                          />
                                          {!!val && (
                                            <a
                                              href={val}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                                            >
                                              Abrir link
                                            </a>
                                          )}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                          <button
                                            onClick={() =>
                                              handleLinkChange(
                                                product._id,
                                                extra,
                                                ""
                                              )
                                            }
                                            className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                                          >
                                            Remover
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>

                            <div className="flex justify-end mt-3">
                              <button
                                onClick={() => salvarLinks(product._id, sizes)}
                                className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
                              >
                                Salvar links
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-4">
                      Dica: a primeira imagem é a que aparece nas vitrines.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default List;
