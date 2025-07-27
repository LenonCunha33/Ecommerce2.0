import { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import CartTotal from '../Components/CartTotal';
import Title from '../Components/Title';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };
      switch (paymentMethod) {
        // Chamadas da API para pagamento via dinheiro na entrega
        case 'cod': {
          const response = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            navigate('/pedidos');
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        // Chamadas da API para pagamento via Stripe
        case 'stripe': {
          const response = await axios.post(
            `${backendUrl}/api/order/stripe`,
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            const { session_url } = response.data;
            window.location.replace(session_url);
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'
    >
      {/* --------------- Lado Esquerdo ----------------------- */}

      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3 '>
          <Title text1={'INFORMAÇÕES'} text2={'DE ENTREGA'} />
        </div>
        <div className='flex flex-col sm:flex-row  gap-3'>
          <input
            name='firstName'
            onChange={onChangeHandler}
            value={formData.firstName}
            type='text'
            required
            placeholder='Nome'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
          <input
            name='lastName'
            onChange={onChangeHandler}
            value={formData.lastName}
            type='text'
            required
            placeholder='Sobrenome'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
        </div>
        <input
          name='email'
          onChange={onChangeHandler}
          value={formData.email}
          type='email'
          required
          placeholder='E-mail'
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
        />
        <input
          name='street'
          onChange={onChangeHandler}
          value={formData.street}
          type='text'
          required
          placeholder='Rua'
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
        />
        <div className='flex flex-col sm:flex-row  gap-3'>
          <input
            name='city'
            onChange={onChangeHandler}
            value={formData.city}
            type='text'
            required
            placeholder='Cidade'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
          <input
            name='state'
            onChange={onChangeHandler}
            value={formData.state}
            type='text'
            required
            placeholder='Estado'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
        </div>
        <div className='flex flex-col sm:flex-row  gap-3'>
          <input
            name='zipcode'
            onChange={onChangeHandler}
            value={formData.zipcode}
            type='text'
            required
            placeholder='CEP'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
          <input
            name='country'
            onChange={onChangeHandler}
            value={formData.country}
            type='text'
            required
            placeholder='País'
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          />
        </div>
        <input
          name='phone'
          onChange={onChangeHandler}
          value={formData.phone}
          type='number'
          required
          placeholder='Telefone'
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
        />
      </div>

      {/* --------------- Lado Direito ----------------------- */}

      <div className='mt-8'>
        <div className='mt8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'MÉTODO DE'} text2={'PAGAMENTO'} />

          {/* -------------- Seleção do método de pagamento -------------- */}

          <div className='flex flex-col lg:flex-row gap-4'>
            <div
              onClick={() => {
                setPaymentMethod('stripe');
              }}
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >
              <p
                className={` min-w-3.5 h-3.5 border rounded-full ${
                  paymentMethod === 'stripe' ? 'bg-green-400' : ''
                }`}
              ></p>
              <img className='h5 mx-4' src={assets.stripe_logo} alt='' />
            </div>
            <div
              onClick={() => {
                setPaymentMethod('cod');
              }}
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >
              <p
                className={` min-w-3.5 h-3.5 border rounded-full ${
                  paymentMethod === 'cod' ? 'bg-green-400' : ''
                }`}
              ></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>
                DINHEIRO NA ENTREGA
              </p>
            </div>
          </div>

          {/* -------------- Botão de finalizar -------------- */}

          <div className='w-full text-end mt-8'>
            <button
              type='submit'
              className='bg-black text-white px-16 py-3 text-sm cursor-pointer'
            >
              FINALIZAR PEDIDO
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
