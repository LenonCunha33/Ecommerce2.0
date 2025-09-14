import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = 'R$';
  const delivery_fee = 15;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [orders, setOrders] = useState([]); // Novo estado para armazenar os pedidos
  const navigate = useNavigate(); // para navegar entre páginas
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error('Por favor, selecione um tamanho');
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size]
        ? (cartData[itemId][size] += 1)
        : (cartData[itemId][size] = 1);
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + '/api/cart/add',
          {
            itemId,
            size,
          },
          {
            headers: {
              token,
            },
          }
        );

        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          console.log('erro', response.data.message);
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  };

  const addOrder = () => {
    let tempOrders = structuredClone(orders);
    let newOrder = [];

    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          newOrder.push({
            _id: item,
            size,
            quantity: cartItems[item][size],
          });
        }
      }
    }
    setOrders([...tempOrders, ...newOrder]);
    //setCartItems({}); // Limpa o carrinho após fazer o pedido
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      // Verifica se esse ID de item existe no array de produtos
      const productExists = products.find((product) => product._id === item);

      // Conta apenas itens que existem no banco de dados
      if (productExists) {
        for (const size in cartItems[item]) {
          if (cartItems[item][size] > 0) {
            totalCount += cartItems[item][size];
          }
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + '/api/cart/update',
          {
            itemId,
            size,
            quantity,
          },
          {
            headers: {
              token,
            },
          }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      const productInfo = products.find((product) => product._id === item);
      if (productInfo) {
        for (const size in cartItems[item]) {
          try {
            if (cartItems[item][size] > 0) {
              totalAmount += productInfo.price * cartItems[item][size];
            }
          } catch (error) {
            console.log('erro', error);
          }
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/cart/get',
        {},
        {
          headers: {
            token,
          },
        }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // dentro do ShopContextProvider
const [discount, setDiscount] = useState(0);

const applyCoupon = async (code) => {
  try {
    const res = await axios.post(`${backendUrl}/api/coupon/validate`, { code });
    if (res.data.success) {
      setDiscount(res.data.discount);
      toast.success(res.data.message);
    } else {
      toast.error(res.data.message);
      setDiscount(0);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Erro ao validar cupom");
    setDiscount(0);
  }
};

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      getUserCart(localStorage.getItem('token'));
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    addOrder, // Adiciona para permitir fazer pedidos
    orders,
    navigate,
    backendUrl,
    token,
    setToken,
    discount,
  setDiscount,
  applyCoupon,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
