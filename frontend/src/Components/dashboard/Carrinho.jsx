import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import { assets } from '../../assets/assets';

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

  if (cartData.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Você não tem carrinhos ainda</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Itens no seu carrinho</h2>
      <div className="space-y-4">
        {cartData.map((item, index) => {
          const productData = products.find(p => p._id === item._id);
          if (!productData) return null;

          return (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={productData.image[0]}
                  alt={productData.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{productData.name}</p>
                  <p className="text-xs text-gray-600">
                    {currency}{productData.price} • {item.size} • {item.quantity}x
                  </p>
                </div>
              </div>
              <img
                src={assets.bin_icon}
                alt="Remover"
                className="w-4 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => updateQuantity(item._id, item.size, 0)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
