import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';
import { motion } from 'framer-motion';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const latest = products.slice(0, 10);
    setLatestProducts(latest);
  }, [products]);

  return (
    <section className='py-12 px-4 sm:px-6 lg:px-16 bg-white'>
      {/* Título */}
      <motion.div 
        className='text-center mb-10'
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title text1='ÚLTIMAS' text2='COLEÇÕES' />
        <p className='mt-4 max-w-xl mx-auto text-sm sm:text-base text-gray-600'>
          Descubra nossas novidades que unem estilo e conforto. Explore as últimas tendências da moda, selecionadas especialmente para você.
        </p>
      </motion.div>

      {/* Produtos */}
      <motion.div 
        className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'
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
        {latestProducts.map((product, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 20 },
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
    </section>
  );
};

export default LatestCollection;
