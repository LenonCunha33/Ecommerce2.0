import { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', category: '', price: '' });

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
      toast.error(error.response?.data?.message || 'Erro ao buscar produtos.');
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
      toast.error(error.response?.data?.message || 'Erro ao remover produto.');
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
        toast.success('Produto atualizado!');
        setEditId(null);
        buscarLista();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto.');
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
      toast.error(error.response?.data?.message || 'Erro ao alterar visibilidade.');
    }
  };

  useEffect(() => {
    buscarLista();
  }, []);

  return (
    <section className="p-4 sm:p-6 md:p-10">
      <motion.h2
        className="text-xl sm:text-2xl font-semibold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Lista de Todos os Produtos
      </motion.h2>

      <div className="flex flex-col gap-3">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 font-semibold">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Visível</span>
          <span className="text-center">Ação</span>
        </div>

        {list.map((product, index) => (
          <motion.div
            key={product._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg shadow-sm bg-white text-sm text-gray-700"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            <img
              src={product.image[0]}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-md border"
            />

            {editId === product._id ? (
              <input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="px-2 py-1 border rounded w-full"
              />
            ) : (
              <p className="truncate font-medium text-gray-900">{product.name}</p>
            )}

            {editId === product._id ? (
              <input
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="px-2 py-1 border rounded w-full"
              />
            ) : (
              <p className="text-gray-600">{product.category}</p>
            )}

            {editId === product._id ? (
              <input
                type="number"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                className="px-2 py-1 border rounded w-full"
              />
            ) : (
              <p className="hidden md:block font-semibold text-gray-800">
                {currency}{product.price}
              </p>
            )}

            {/* Botão Visibilidade */}
            <motion.button
              onClick={() => toggleVisibility(product._id, !product.visible)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`w-4 h-4 rounded-full cursor-pointer mx-auto transition-colors duration-200 ${
                product.visible ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={product.visible ? 'Produto visível' : 'Produto oculto'}
            ></motion.button>

            {/* Botões Ação */}
            <div className="flex justify-end md:justify-center gap-2">
              {editId === product._id ? (
                <motion.button
                  onClick={() => salvarEdicao(product._id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer transition"
                  title="Salvar"
                >
                  ✔
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    setEditId(product._id);
                    setEditData({ name: product.name, category: product.category, price: product.price });
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer transition"
                  title="Editar"
                >
                  ✎
                </motion.button>
              )}
              <motion.button
                onClick={() => removerProduto(product._id)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer transition"
                title="Remover"
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
