import { useEffect, useMemo, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    price: "",
  });

  // Controle de expansão por produto (mostrar painel de variantes)
  const [expanded, setExpanded] = useState({}); // { [productId]: boolean }

  // Estados locais para edição de UMA variante por vez (por linha)
  const [rowEdit, setRowEdit] = useState({}); // key `${productId}:${size}` -> { size, sku }
  const [rowDelta, setRowDelta] = useState({}); // key `${productId}:${size}` -> string/number delta

  // Formulário de "novo tamanho" por produto
  const [newVarForm, setNewVarForm] = useState({}); // { [productId]: { size:"", sku:"", stock:"", isActive:true } }

  const authHeaders = useMemo(() => ({ headers: { token } }), [token]);

  const buscarLista = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, authHeaders);
      if (response.data.success) {
        setList(response.data.products || []);
      } else {
        toast.error(response.data.message || "Falha ao carregar produtos.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao buscar produtos.");
    }
  };

  const removerProduto = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/remove`, { id }, authHeaders);
      if (response.data.success) {
        toast.success(response.data.message || "Produto removido!");
        buscarLista();
      } else {
        toast.error(response.data.message || "Não foi possível remover.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover produto.");
    }
  };

  const salvarEdicao = async (id) => {
    try {
      const response = await axios.put(`${backendUrl}/api/product/update`, { id, ...editData }, authHeaders);
      if (response.data.success) {
        toast.success("Produto atualizado com sucesso!");
        setEditId(null);
        buscarLista();
      } else {
        toast.error(response.data.message || "Não foi possível atualizar.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar produto.");
    }
  };

  const toggleVisibility = async (id, visible) => {
    try {
      const response = await axios.patch(`${backendUrl}/api/product/toggle-visibility`, { id, visible }, authHeaders);
      if (response.data.success) {
        buscarLista();
      } else {
        toast.error(response.data.message || "Não foi possível alterar visibilidade.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao alterar visibilidade.");
    }
  };

  // ======== CONTROLE DE VARIANTES (TAMANHOS) ========

  const keyOf = (productId, size) => `${productId}:${size}`;

  const startRowEdit = (productId, v) => {
    setRowEdit((prev) => ({
      ...prev,
      [keyOf(productId, v.size)]: { size: v.size, sku: v.sku || "" },
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
    const data = rowEdit[k];
    if (!data) return;

    try {
      const payload = {
        originalSize,
        size: (data.size || "").trim(),
        sku: (data.sku || "").trim(),
      };
      if (!payload.size) {
        toast.error("O tamanho não pode ficar vazio.");
        return;
      }

      await axios.put(`${backendUrl}/api/product/${productId}/variant/upsert`, payload, authHeaders);
      toast.success("Tamanho/SKU atualizado!");
      cancelRowEdit(productId, originalSize);
      buscarLista();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar tamanho.");
    }
  };

  const toggleVariantActive = async (productId, size, isActive) => {
    try {
      await axios.patch(`${backendUrl}/api/product/${productId}/variant/toggle`, { size, isActive }, authHeaders);
      buscarLista();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao alterar disponibilidade do tamanho.");
    }
  };

  const adjustVariantStock = async (productId, size, delta, reason = "") => {
    const qty = Number(delta);
    if (!Number.isFinite(qty) || qty === 0) {
      toast.error("Informe um ajuste de estoque válido (ex.: -1, +1, +5).");
      return;
    }
    try {
      await axios.patch(`${backendUrl}/api/product/${productId}/variant/stock`, { size, qty, reason }, authHeaders);
      toast.success("Estoque ajustado!");
      setRowDelta((prev) => ({ ...prev, [keyOf(productId, size)]: "" }));
      buscarLista();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao ajustar estoque.");
    }
  };

  const createVariant = async (productId) => {
    const form = newVarForm[productId] || {};
    const size = (form.size || "").trim();
    const sku = (form.sku || "").trim();
    const stock = Number(form.stock ?? 0);
    const isActive = !!form.isActive;

    if (!size) {
      toast.error("Informe o tamanho (ex.: P, M, G).");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("Estoque inicial inválido.");
      return;
    }

    try {
      await axios.put(`${backendUrl}/api/product/${productId}/variant/upsert`, { size, sku, stock, isActive }, authHeaders);
      toast.success("Tamanho adicionado/atualizado!");
      setNewVarForm((prev) => ({ ...prev, [productId]: { size: "", sku: "", stock: "", isActive: true } }));
      buscarLista();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar tamanho.");
    }
  };

  const deleteVariant = async (productId, size) => {
    if (!window.confirm(`Remover o tamanho "${size}" deste produto?`)) return;
    try {
      await axios.delete(`${backendUrl}/api/product/${productId}/variant`, { data: { size }, ...authHeaders });
      toast.success("Tamanho removido!");
      buscarLista();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover tamanho.");
    }
  };

  useEffect(() => {
    buscarLista();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, ease: "easeOut" } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <section className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto" aria-labelledby="product-list-title">
      <motion.h1
        id="product-list-title"
        className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Gerenciamento de Produtos – Catálogo Completo
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-8 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Edite dados, altere tamanhos/SKU, ative/desative variantes e ajuste estoque por tamanho.
      </motion.p>

      <motion.div className="flex flex-col gap-4" variants={containerVariants} initial="hidden" animate="show">
        {/* Cabeçalho - Desktop */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Visível</span>
          <span className="text-center">Ações</span>
        </div>

        {list.map((product, index) => {
          const isExpanded = !!expanded[product._id];
          const variants = Array.isArray(product.variants) ? product.variants : [];

          return (
            <motion.div
              key={product._id}
              variants={itemVariants}
              className="rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition"
            >
              {/* Linha principal */}
              <div
                className="grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 text-sm sm:text-base text-gray-700"
              >
                {/* Imagem */}
                <img
                  src={product.image?.[0]}
                  alt={`Imagem do produto ${product.name}`}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border shadow-sm"
                  loading="lazy"
                />

                {/* Nome */}
                {editId === product._id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <button
                    className="truncate font-medium text-gray-900 text-left hover:underline"
                    onClick={() => setExpanded((prev) => ({ ...prev, [product._id]: !isExpanded }))}
                    title="Mostrar/ocultar tamanhos"
                  >
                    {product.name}
                  </button>
                )}

                {/* Categoria */}
                {editId === product._id ? (
                  <input
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <p className="text-gray-600">{product.category}</p>
                )}

                {/* Preço */}
                {editId === product._id ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="px-2 py-1 border rounded w-full"
                  />
                ) : (
                  <p className="hidden md:block font-semibold text-gray-800">
                    {currency}
                    {product.price}
                  </p>
                )}

                {/* Visibilidade do produto */}
                <motion.button
                  onClick={() => toggleVisibility(product._id, !product.visible)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-5 h-5 rounded-full mx-auto transition-colors duration-200 ${
                    product.visible ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
                  }`}
                  aria-label={product.visible ? "Produto visível no catálogo" : "Produto oculto no catálogo"}
                />

                {/* Ações */}
                <div className="flex justify-start sm:justify-end md:justify-center gap-2">
                  {editId === product._id ? (
                    <motion.button
                      onClick={() => salvarEdicao(product._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-semibold transition"
                      title="Salvar alterações"
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
                          price: product.price,
                        });
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                      title="Editar produto"
                    >
                      ✎
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => {
                      if (window.confirm("Tem certeza que deseja remover este produto? Essa ação não poderá ser desfeita.")) {
                        removerProduto(product._id);
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                    title="Remover produto"
                  >
                    ✕
                  </motion.button>

                  <motion.button
                    onClick={() => setExpanded((prev) => ({ ...prev, [product._id]: !isExpanded }))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition"
                    title="Controle de tamanhos e estoque"
                  >
                    {isExpanded ? "Ocultar tamanhos" : "Tamanhos/Estoque"}
                  </motion.button>
                </div>
              </div>

              {/* Painel de variantes (tamanhos) */}
              {isExpanded && (
                <div className="px-4 pb-5">
                  {/* Tabela de variantes */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm mt-2 border-t">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-2 py-2">Tamanho</th>
                          <th className="text-left px-2 py-2">SKU</th>
                          <th className="text-left px-2 py-2">Estoque</th>
                          <th className="text-center px-2 py-2">Ativo</th>
                          <th className="text-left px-2 py-2">Ajuste rápido</th>
                          <th className="text-center px-2 py-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-2 py-4 text-center text-gray-500">
                              Nenhum tamanho cadastrado ainda.
                            </td>
                          </tr>
                        )}

                        {variants.map((v) => {
                          const k = keyOf(product._id, v.size);
                          const isRowEditing = !!rowEdit[k];

                          return (
                            <tr key={k} className="border-b last:border-b-0">
                              {/* Tamanho */}
                              <td className="px-2 py-2">
                                {isRowEditing ? (
                                  <input
                                    className="px-2 py-1 border rounded w-28"
                                    value={rowEdit[k].size}
                                    onChange={(e) => handleRowEditChange(product._id, v.size, "size", e.target.value)}
                                  />
                                ) : (
                                  <span className="font-medium text-gray-900">{v.size}</span>
                                )}
                              </td>

                              {/* SKU */}
                              <td className="px-2 py-2">
                                {isRowEditing ? (
                                  <input
                                    className="px-2 py-1 border rounded w-40"
                                    placeholder="SKU (opcional)"
                                    value={rowEdit[k].sku}
                                    onChange={(e) => handleRowEditChange(product._id, v.size, "sku", e.target.value)}
                                  />
                                ) : (
                                  <span className="text-gray-700">{v.sku || "—"}</span>
                                )}
                              </td>

                              {/* Estoque atual */}
                              <td className="px-2 py-2">
                                <span className={`font-semibold ${v.stock > 0 ? "text-gray-900" : "text-red-600"}`}>
                                  {v.stock}
                                </span>
                              </td>

                              {/* Ativo */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  onClick={() => toggleVariantActive(product._id, v.size, !v.isActive)}
                                  className={`inline-block w-5 h-5 rounded-full transition-colors ${
                                    v.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
                                  }`}
                                  title={v.isActive ? "Tamanho ativo (visível)" : "Tamanho inativo (oculto)"}
                                  aria-label={v.isActive ? "Tamanho ativo" : "Tamanho inativo"}
                                />
                              </td>

                              {/* Ajuste rápido de estoque */}
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => adjustVariantStock(product._id, v.size, -1, "ajuste rápido")}
                                    className="px-2 py-1 rounded border bg-white hover:bg-gray-50"
                                    title="−1"
                                  >
                                    −1
                                  </button>
                                  <button
                                    onClick={() => adjustVariantStock(product._id, v.size, +1, "ajuste rápido")}
                                    className="px-2 py-1 rounded border bg-white hover:bg-gray-50"
                                    title="+1"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => adjustVariantStock(product._id, v.size, +5, "ajuste rápido")}
                                    className="px-2 py-1 rounded border bg-white hover:bg-gray-50"
                                    title="+5"
                                  >
                                    +5
                                  </button>

                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Δ"
                                    className="px-2 py-1 border rounded w-20"
                                    value={rowDelta[k] ?? ""}
                                    onChange={(e) => setRowDelta((prev) => ({ ...prev, [k]: e.target.value }))}
                                  />
                                  <button
                                    onClick={() => adjustVariantStock(product._id, v.size, rowDelta[k] ?? 0, "ajuste manual")}
                                    className="px-2 py-1 rounded bg-black text-white hover:opacity-90"
                                  >
                                    Aplicar
                                  </button>
                                </div>
                              </td>

                              {/* Ações da linha */}
                              <td className="px-2 py-2 text-center">
                                {isRowEditing ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => saveRowEdit(product._id, v.size)}
                                      className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                                      title="Salvar tamanho/SKU"
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      onClick={() => cancelRowEdit(product._id, v.size)}
                                      className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                                      title="Cancelar"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => startRowEdit(product._id, v)}
                                      className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                                      title="Editar tamanho/SKU"
                                    >
                                      ✎
                                    </button>
                                    <button
                                      onClick={() => deleteVariant(product._id, v.size)}
                                      className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                                      title="Remover tamanho"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Linha para adicionar novo tamanho */}
                        <tr className="bg-gray-50">
                          <td className="px-2 py-3">
                            <input
                              className="px-2 py-1 border rounded w-28"
                              placeholder="Tamanho (P/M/G)"
                              value={newVarForm[product._id]?.size || ""}
                              onChange={(e) =>
                                setNewVarForm((prev) => ({
                                  ...prev,
                                  [product._id]: { ...(prev[product._id] || {}), size: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-3">
                            <input
                              className="px-2 py-1 border rounded w-40"
                              placeholder="SKU (opcional)"
                              value={newVarForm[product._id]?.sku || ""}
                              onChange={(e) =>
                                setNewVarForm((prev) => ({
                                  ...prev,
                                  [product._id]: { ...(prev[product._id] || {}), sku: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="number"
                              className="px-2 py-1 border rounded w-24"
                              placeholder="Estoque"
                              value={newVarForm[product._id]?.stock ?? ""}
                              onChange={(e) =>
                                setNewVarForm((prev) => ({
                                  ...prev,
                                  [product._id]: { ...(prev[product._id] || {}), stock: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!(newVarForm[product._id]?.isActive ?? true)}
                                onChange={(e) =>
                                  setNewVarForm((prev) => ({
                                    ...prev,
                                    [product._id]: { ...(prev[product._id] || {}), isActive: e.target.checked },
                                  }))
                                }
                              />
                              <span className="text-xs text-gray-700">Ativo</span>
                            </label>
                          </td>
                          <td className="px-2 py-3"></td>
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

                  {/* Dica visual de sincronização */}
                  <p className="text-xs text-gray-500 mt-3">
                    Tamanhos exibidos no site são sincronizados automaticamente com as variantes <strong>ativas</strong> e com{" "}
                    <strong>estoque &gt; 0</strong>.
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default List;
