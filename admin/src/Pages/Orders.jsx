import { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const buscarPedidos = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const atualizarStatusPedido = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, orderStatus: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await buscarPedidos();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    buscarPedidos();
  }, [token]);

  return (
    <div>
      <h3>Página de Pedidos</h3>
      <div>
        {orders.map((order, index) => (
          <div
            key={index}
            className='grid grid-cols-1 md:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-300 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700'
          >
            <img className='w-12' src={assets.parcel_icon} alt='Ícone de pacote' />
            <div>
              <div>
                {order.items.map((item, index) => (
                  <p className='py-0.5' key={index}>
                    {item.name} x {item.quantity} <span>{item.size}</span>
                  </p>
                ))}
              </div>
              <p className='mt-3 mb-2 font-medium'>
                {order.address.firstName + ' ' + order.address.lastName}
              </p>

              <div>
                <p>{order.address.street + ','}</p>
                <p>
                  {order.address.city +
                    ', ' +
                    order.address.state +
                    ', ' +
                    order.address.country +
                    ', ' +
                    order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>

            <div>
              <p className='text-sm sm:text-[15px]'>Itens: {order.items.length}</p>
              <p className='mt-3'>Método: {order.paymentMethod}</p>
              <p>Status do Pagamento: {order.payment ? 'Pago' : 'Pendente'}</p>
              <p>Data: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <p className='text-sm sm:text-[15px]'>
              Valor: {currency}
              {order.amount}
            </p>

            <select
              onChange={(event) => atualizarStatusPedido(event, order._id)}
              value={order.orderStatus}
              className='p-2 font-semibold cursor-pointer'
            >
              <option value='Order Placed'>Pedido Realizado</option>
              <option value='Packing'>Embalando</option>
              <option value='Shipped'>Enviado</option>
              <option value='Out for Delivery'>Saiu para Entrega</option>
              <option value='Delivered'>Entregue</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
