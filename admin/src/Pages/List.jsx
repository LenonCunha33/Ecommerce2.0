import { useEffect, useState } from "react";
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

  const buscarLista = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
      });

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao buscar produtos.");
    }
  };

  const removerProduto = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        buscarLista();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover produto.");
    }
  };

  const salvarEdicao = async (id) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/product/update`,
        { id, ...editData },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Produto atualizado com sucesso!");
        setEditId(null);
        buscarLista();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar produto.");
    }
  };

  const toggleVisibility = async (id, visible) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/product/toggle-visibility`,
        { id, visible },
        { headers: { token } }
      );
      if (response.data.success) {
        buscarLista();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao alterar visibilidade."
      );
    }
  };

  useEffect(() => {
    buscarLista();
  }, []);

  return (
    <section
      className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto"
      aria-labelledby="product-list-title"
    >
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
        Administre sua loja digital de forma simples e eficiente: edite
        informações, ajuste categorias, altere preços, gerencie visibilidade e
        mantenha o controle total do seu{" "}
        <strong className="text-gray-800">catálogo de produtos online</strong>.
      </motion.p>

      <div className="flex flex-col gap-4">
        {/* Cabeçalho - Desktop */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Visível</span>
          <span className="text-center">Ações</span>
        </div>

        {list.map((product, index) => (
          <motion.div
            key={product._id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 border border-gray-200 rounded-xl shadow-md bg-white text-sm sm:text-base text-gray-700 hover:shadow-lg transition"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            viewport={{ once: true }}
          >
            {/* Imagem */}
            <img
              src={product.image[0]}
              alt={`Imagem do produto ${product.name}`}
              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border shadow-sm"
              loading="lazy"
            />

            {/* Nome */}
            {editId === product._id ? (
              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="px-2 py-1 border rounded w-full"
              />
            ) : (
              <p className="truncate font-medium text-gray-900">
                {product.name}
              </p>
            )}

            {/* Categoria */}
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

            {/* Preço */}
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
              <p className="hidden md:block font-semibold text-gray-800">
                {currency}
                {product.price}
              </p>
            )}

            {/* Visibilidade */}
            <motion.button
              onClick={() => toggleVisibility(product._id, !product.visible)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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
            ></motion.button>

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
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default List;
