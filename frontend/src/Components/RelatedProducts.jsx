import { ShopContext } from '../Context/ShopContext';
import { useContext, useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [relatedProd, setRelatedProd] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = products.filter(
        (product) =>
          product.category === category && product.subCategory === subCategory
      );
      setRelatedProd(filtered.slice(0, 5));
    }
  }, [products, category, subCategory]);

  return (
    <div className="my-20 px-4 sm:px-8 lg:px-20">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <Title text1="PRODUTOS" text2="RELACIONADOS" />
      </motion.div>

      {/* Grid de produtos */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {relatedProd.map((item, index) => (
          <motion.div
            key={item._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <ProductItem
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image}
              className="w-full"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RelatedProducts;
