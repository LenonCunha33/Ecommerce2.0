import { useContext, useEffect, useState } from 'react';
import Title from '../Components/Title';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext);

  // Dados dos pedidos
  const [orderData, setOrderData] = useState([]);

  // Buscar dados dos pedidos
  const fetchOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let allOrderItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['orderStatus'] = order.orderStatus;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrderItem.push(item);
          });
        });

        setOrderData(allOrderItem);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [token]);

  // Função para formatar a data atual
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  // Obter a data atual
  const currentDate = formatDate(new Date());

  return (
    <div className='pt-16 border-t'>
      <div className='mb-3 text-2xl'>
        <Title text1={'MEUS'} text2={'PEDIDOS'} />
      </div>
      <div>{}</div>

      {orderData.length === 0 ? (
        <p className='text-gray-500'>Você não tem pedidos.</p>
      ) : (
        <div>
          {orderData.map((item, index) => {
            return (
              <div
                key={index}
                className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between g4'
              >
                <div className='flex items-start gap-6'>
                  <img src={item.image[0]} alt='' className='w-16 sm:w-20' />

                  <div>
                    <p className='sm:text-base font-medium'>{item.name}</p>

                    <div className='flex items-center gap-5 mt-1 text-base text-gray-700'>
                      <p>
                        {currency}
                        {item.price}
                      </p>
                      <p>Quantidade: {item.quantity}</p>
                      <p>Tamanho: {item.size}</p>
                    </div>
                    <p className='mt-1'>
                      Data: <span className='text-gray-400'>{currentDate}</span>
                    </p>
                    <p className='mt-1'>
                      Método de Pagamento:{' '}
                      <span className='text-gray-400'>
                        {item.paymentMethod}
                      </span>
                    </p>
                  </div>
                </div>

                <div className='flex justify-between md:w-1/2'>
                  <div className='flex items-center gap-2'>
                    <p className='min-w-2 h-2 rounded-full bg-green-400'></p>
                    <p className='text-sm md:text-base'>{item.orderStatus}</p>
                  </div>
                  <button
                    onClick={fetchOrderData}
                    className='border px-4 py-2 text-sm font-medium rounded-sm text-gray-700 cursor-pointer hover:bg-gray-100'
                  >
                    Rastrear Pedido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
