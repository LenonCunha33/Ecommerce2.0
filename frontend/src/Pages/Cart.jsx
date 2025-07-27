import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from '../Components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../Components/CartTotal';
import { motion } from 'framer-motion';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, addOrder } =
    useContext(ShopContext);
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

  return (
    <div className='pt-16 px-4 sm:px-6 lg:px-20 border-t'>
      <div className='mb-6 text-2xl'>
        <Title text1='SEU' text2='CARRINHO' />
      </div>

      {/* Itens do Carrinho */}
      <div className='space-y-6'>
        {cartData.map((item, index) => {
          const productsData = products.find(
            (product) => product._id === item._id
          );

          if (!productsData) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={index}
              className='p-4 rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white'
            >
              {/* Produto */}
              <div className='flex items-start gap-4'>
                <img
                  src={productsData.image[0]}
                  alt={productsData.name}
                  className='w-20 h-20 rounded-lg object-cover'
                />
                <div>
                  <p className='text-base font-semibold text-gray-800'>
                    {productsData.name}
                  </p>
                  <div className='flex items-center gap-4 mt-2'>
                    <p className='text-sm text-gray-700'>
                      {currency}
                      {productsData.price}
                    </p>
                    <span className='text-xs bg-slate-100 text-gray-600 px-2 py-1 rounded-md border'>
                      {item.size}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className='flex items-center gap-4'>
                <input
                  type='number'
                  min={1}
                  defaultValue={item.quantity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0) {
                      updateQuantity(item._id, item.size, value);
                    }
                  }}
                  className='w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/60'
                />
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  src={assets.bin_icon}
                  alt='Remover'
                  className='w-5 cursor-pointer hover:scale-110 transition-transform duration-200'
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total e Finalizar */}
      <div className='flex justify-end mt-16 mb-8'>
        <div className='w-full sm:w-[400px] bg-white rounded-xl shadow-lg p-6 space-y-6'>
          <CartTotal />

          <button
            onClick={() => {
              addOrder();
              navigate('/fazer-pedido');
            }}
            className='w-full py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors duration-300'
          >
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
