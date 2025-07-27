import { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import { motion } from 'framer-motion';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <motion.section
      className="w-full max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8 transition-all"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Título */}
      <div className="mb-6">
        <Title text1="CARRINHO" text2="TOTAL" />
      </div>

      {/* Resumo do carrinho */}
      <motion.div
        className="flex flex-col gap-4 text-sm sm:text-base text-gray-700"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {/* Subtotal */}
        <motion.div
          className="flex justify-between items-center border-b pb-2"
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
        >
          <span>Subtotal</span>
          <span className="font-medium">
            {currency} {subtotal}.00
          </span>
        </motion.div>

        {/* Taxa de Entrega */}
        <motion.div
          className="flex justify-between items-center border-b pb-2"
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
        >
          <span>Taxa de Entrega</span>
          <span className="font-medium">
            {currency} {delivery_fee}.00
          </span>
        </motion.div>

        {/* Total */}
        <motion.div
          className="flex justify-between items-center text-lg font-semibold text-black mt-2"
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
        >
          <span>Total</span>
          <span>
            {currency} {total}.00
          </span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default CartTotal;
