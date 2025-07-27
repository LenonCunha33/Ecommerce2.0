import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (products) {
      const bestProduct = products.filter((product) => product.bestseller);
      setBestSeller(bestProduct.slice(0, 5));
    }
  }, [products]);

  return (
    <motion.section
      className="w-full px-4 sm:px-6 lg:px-16 py-12 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {/* Título */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title text1="MELHORES" text2="VENDEDORES" />
        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-gray-600">
          Nossos produtos mais vendidos que nossos clientes não se cansam de comprar.
          Compre os itens mais populares da nossa loja.
        </p>
      </motion.div>

      {/* Grid de Produtos */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {bestSeller.map((product, idx) => (
          <motion.div
            key={product._id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <ProductItem
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default BestSeller;
