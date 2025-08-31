import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import { assets } from "../../assets/assets";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Carrinho() {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let tempData = [];
      for (const item in cartItems) {
        for (const size in cartItems[item]) {
          if (cartItems[item][size] > 0) {
            tempData.push({
              _id: item,
              size: size,
              quantity: cartItems[item][size],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  // Se carrinho vazio
  if (cartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 px-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Seu Carrinho de Compras está vazio
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Adicione produtos ao seu carrinho e conclua sua compra com segurança.  
          Explore nossas categorias e encontre as melhores ofertas.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-900 transition"
        >
          Continuar Comprando
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* SEO Heading */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Itens no seu Carrinho de Compras
      </h1>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        <AnimatePresence>
          {cartData.map((item, index) => {
            const productData = products.find((p) => p._id === item._id);
            if (!productData) return null;

            return (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 gap-4"
              >
                {/* Produto */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={productData.image[0]}
                    alt={`Produto: ${productData.name}`}
                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                  />
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      {productData.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {currency}{productData.price} • {item.size} • {item.quantity}x
                    </p>
                  </div>
                </div>

                {/* Remover */}
                <motion.img
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  src={assets.bin_icon}
                  alt="Remover do Carrinho"
                  className="w-5 h-5 cursor-pointer text-red-500"
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CTA Finalizar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center"
      >
        <Link
          to="/checkout"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          Finalizar Compra
        </Link>
      </motion.div>
    </motion.section>
  );
}
