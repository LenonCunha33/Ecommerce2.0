import { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const List = ({ token }) => {
  const [list, setList] = useState([]);

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
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao buscar produtos.');
    }
  };

  const removerProduto = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        buscarLista();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao remover produto.');
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
        {/* Cabeçalho (esconde no mobile) */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 font-semibold">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span className="text-center">Ação</span>
        </div>

        {/* Lista de produtos */}
        {list.map((product, index) => (
          <motion.div
            key={index}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg shadow-sm bg-white text-sm text-gray-700"
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

            <p className="truncate font-medium text-gray-900">{product.name}</p>
            <p className="text-gray-600">{product.category}</p>

            <p className="hidden md:block font-semibold text-gray-800">
              {currency}
              {product.price}
            </p>

            <button
              onClick={() => removerProduto(product._id)}
              className="justify-self-end md:justify-self-center text-red-500 hover:text-red-600 text-base font-bold transition duration-200"
              aria-label="Remover produto"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default List;
