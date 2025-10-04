import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Modal genérico ---------- */
function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                Fechar
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Templates ---------- */
const seedTemplates = [
  {
    title: "Dica de Treino: Conjunto RespTech",
    body: "Para treinos intensos, experimente tecidos respiráveis com compressão suave. Veja as opções selecionadas para você.",
    type: "tip",
    icon: "lightbulb",
    link: "",
    productId: "",
  },
  {
    title: "Oferta Exclusiva de Hoje",
    body: "Peças selecionadas com preços especiais por tempo limitado. Acesse agora e aproveite.",
    type: "promo",
    icon: "sale",
    link: "",
    productId: "",
  },
];

/* ---------- Helpers ---------- */
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null;
  return token ? { Authorization: `Bearer ${token}`, token } : {};
};

export default function Notifications() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // notifications admin list
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // form
  const [targetAll, setTargetAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState(seedTemplates[0]);
  const [openPreview, setOpenPreview] = useState(false);

  // edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    type: "tip",
    icon: "lightbulb",
    link: "",
    productId: "",
    _mark: "unread",
  });

  /* ------ Loaders ------ */
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const headers = getAuthHeaders();
      const { data } = await axios.get(`${backendUrl}/api/user/users`, { headers });
      if (data?.success) setUsers(data.users || []);
      else setUsersError("Não foi possível carregar a lista de usuários.");
    } catch (e) {
      setUsersError("Erro de conexão ao carregar usuários.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAdminList = async () => {
    try {
      setListLoading(true);
      const headers = getAuthHeaders();
      const { data } = await axios.get(`${backendUrl}/api/notification/admin/list`, { headers });
      if (data?.success) setList(data.items || []);
    } catch {
      /* ignore */
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    // carrega envios recentes sempre
    loadAdminList();
  }, [backendUrl]);

  // quando alternar para “Selecionar usuários”, carrega se ainda não tiver
  useEffect(() => {
    if (!targetAll && users.length === 0 && !usersLoading) {
      loadUsers();
    }
  }, [targetAll]); // eslint-disable-line

  /* ------ Users - filtros e seleção ------ */
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.celular || u.whatsapp || u.telefone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, userSearch]);

  const toggleId = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : prev.concat(id)));

  const selectAllFiltered = () => {
    const ids = filteredUsers.map((u) => u._id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => setSelectedIds([]);

  /* ------ Envio ------ */
  const sendNow = async () => {
    if (!targetAll && selectedIds.length === 0) {
      alert("Selecione pelo menos 1 usuário para envio direcionado.");
      return;
    }
    const payload = {
      title: form.title,
      body: form.body,
      type: form.type,
      icon: form.icon,
      link: form.link,
      productId: form.productId || null,
      target: targetAll ? "all" : "users",
      userIds: targetAll ? [] : selectedIds,
    };
    const headers = getAuthHeaders();
    await axios.post(`${backendUrl}/api/notification/admin/send`, payload, { headers });
    await loadAdminList();
    setOpenPreview(false);
  };

  /* ------ Edit ------ */
  const onClickEdit = (n) => {
    setEditItem(n);
    setEditForm({
      title: n.title || "",
      body: n.body || "",
      type: n.type || "tip",
      icon: n.icon || "lightbulb",
      link: n.link || "",
      productId: n.product?._id || "",
      _mark: n.readAt ? "read" : "unread",
    });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    if (!editItem?._id) return;
    const payload = {
      title: editForm.title,
      body: editForm.body,
      type: editForm.type,
      icon: editForm.icon,
      link: editForm.link,
      productId: editForm.productId || null,
      markUnread: editForm._mark === "unread" ? true : undefined,
      markRead: editForm._mark === "read" ? true : undefined,
    };
    const headers = getAuthHeaders();
    await axios.patch(`${backendUrl}/api/notification/admin/${editItem._id}`, payload, { headers });
    setOpenEdit(false);
    setEditItem(null);
    await loadAdminList();
  };

  const removeItem = async (id) => {
    if (!confirm("Excluir esta notificação?")) return;
    const headers = getAuthHeaders();
    await axios.delete(`${backendUrl}/api/notification/admin/${id}`, { headers });
    await loadAdminList();
  };

  return (
    <main className="p-6 mt-10 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      <motion.h1
        className="text-2xl md:text-4xl font-extrabold mb-6 tracking-tight text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Notificações
      </motion.h1>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: formulário de envio */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {seedTemplates.map((t, i) => (
              <button
                key={i}
                onClick={() => setForm(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  form.title === t.title
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Template {i + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="tip">Dica</option>
                <option value="promo">Promoção</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Ícone</label>
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="lightbulb">Lâmpada</option>
                <option value="sale">Oferta</option>
                <option value="gift">Presente</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Link (opcional)</label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">ID do Produto (opcional)</label>
              <input
                type="text"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
                placeholder="ObjectId"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Mensagem</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 h-28"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="target" checked={targetAll} onChange={() => setTargetAll(true)} />
                <span className="text-sm">Todos os usuários</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="target" checked={!targetAll} onChange={() => setTargetAll(false)} />
                <span className="text-sm">Selecionar usuários</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenPreview(true)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Pré-visualizar
              </button>
              <button
                onClick={sendNow}
                className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: últimos envios */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="text-sm font-semibold mb-3">Últimas notificações</div>
          <div className="max-h-[520px] overflow-y-auto pr-1 -mr-1 divide-y">
            {listLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3 py-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="text-sm text-gray-600">Sem envios.</div>
            ) : (
              list.map((n) => (
                <div key={n._id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">{n.body}</div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString("pt-BR")} · {n.user?.name || "Usuário"} (
                        {n.user?.email || "-"})
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onClickEdit(n)}
                        className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeItem(n._id)}
                        className="text-xs px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <style>{`.line-clamp-2{-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}`}</style>
        </div>
      </section>

      {/* SELEÇÃO DE USUÁRIOS */}
      {!targetAll && (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2">Selecionar usuários</div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone…"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllFiltered}
                disabled={filteredUsers.length === 0}
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                title="Selecionar todos (filtrados)"
              >
                Selecionar todos
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedIds.length === 0}
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Limpar seleção
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-3">
            {usersLoading
              ? "Carregando usuários…"
              : usersError
              ? usersError
              : `${filteredUsers.length} de ${users.length} usuários listados · Selecionados: ${selectedIds.length}`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1 -mr-1">
            {usersLoading ? (
              [...Array(9)].map((_, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Nenhum usuário encontrado para o filtro.</div>
            ) : (
              filteredUsers.map((u) => (
                <label
                  key={u._id}
                  className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition ${
                    selectedIds.includes(u._id) ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u._id)}
                    onChange={() => toggleId(u._id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.name || "-"}</div>
                    <div className="text-xs text-gray-600 truncate">{u.email || "-"}</div>
                    {(u.celular || u.whatsapp || u.telefone) && (
                      <div className="text-[11px] text-gray-500 truncate">
                        {u.celular || u.whatsapp || u.telefone}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </section>
      )}

      {/* Pré-visualização */}
      <Modal open={openPreview} onClose={() => setOpenPreview(false)} title="Pré-visualização">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-emerald-600">
              <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">{form.title}</div>
            <div className="text-sm text-gray-700">{form.body}</div>
          </div>
        </div>
        {!targetAll && (
          <div className="mt-4 text-xs text-gray-600">
            Destinatários selecionados: <strong>{selectedIds.length}</strong>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpenPreview(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Fechar
          </button>
          <button onClick={sendNow} className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
            Enviar
          </button>
        </div>
      </Modal>

      {/* Editar */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Editar notificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600">Título</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Tipo</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="tip">Dica</option>
              <option value="promo">Promoção</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Ícone</label>
            <select
              value={editForm.icon}
              onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="lightbulb">Lâmpada</option>
              <option value="sale">Oferta</option>
              <option value="gift">Presente</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Link (opcional)</label>
            <input
              type="url"
              value={editForm.link}
              onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">ID do Produto (opcional)</label>
            <input
              type="text"
              value={editForm.productId}
              onChange={(e) => setEditForm((f) => ({ ...f, productId: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="ObjectId"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Mensagem</label>
            <textarea
              value={editForm.body}
              onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 h-28"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Status</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mark"
                  checked={editForm._mark === "unread"}
                  onChange={() => setEditForm((f) => ({ ...f, _mark: "unread" }))}
                />
                <span className="text-sm">Marcar como não lida</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mark"
                  checked={editForm._mark === "read"}
                  onChange={() => setEditForm((f) => ({ ...f, _mark: "read" }))}
                />
                <span className="text-sm">Marcar como lida</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpenEdit(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={saveEdit} className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
            Salvar
          </button>
        </div>
      </Modal>
    </main>
  );
}
