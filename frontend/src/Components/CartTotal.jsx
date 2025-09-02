import { useContext, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import { motion } from 'framer-motion';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount, discount, applyCoupon } = useContext(ShopContext);
  const [coupon, setCoupon] = useState('');

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee - discount;

  const handleApplyCoupon = () => {
    if (!coupon) return;
    applyCoupon(coupon);
  };

  return (
    <motion.section
      className="w-full max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8 transition-all"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mb-6">
        <Title text2="TOTAL" />
      </div>

      {/* Resumo */}
      <div className="flex flex-col gap-4 text-sm sm:text-base text-gray-700">
        <div className="flex justify-between border-b pb-2">
          <span>Subtotal</span>
          <span>{currency} {subtotal}.00</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Taxa de Entrega</span>
          <span>{currency} {delivery_fee}.00</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between border-b pb-2 text-green-600">
            <span>Desconto</span>
            <span>- {currency} {discount}.00</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-semibold text-black mt-2">
          <span>Total</span>
          <span>{currency} {total}.00</span>
        </div>
      </div>

      {/* Cupom */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Insira o cupom"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
        type="button"
          onClick={handleApplyCoupon}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Aplicar
        </button>
      </div>
    </motion.section>
  );
};

export default CartTotal;
