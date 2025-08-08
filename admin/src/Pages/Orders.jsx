import { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

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
      console.error(error);
      toast.error(error.message || 'Erro ao buscar pedidos.');
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
        toast.success('Status atualizado com sucesso!');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erro ao atualizar status.');
    }
  };

  useEffect(() => {
    buscarPedidos();
  }, [token]);

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Pedidos Recentes
      </motion.h2>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border border-gray-200 rounded-xl shadow-sm bg-white p-4 sm:p-6 text-xs sm:text-sm text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {/* Ícone */}
            <div className="flex justify-center items-start">
              <img className="w-10 sm:w-12" src={assets.parcel_icon} alt="Ícone de pacote" />
            </div>

            {/* Itens e endereço */}
            <div>
              <div className="mb-2">
                {order.items.map((item, idx) => (
                  <p className="text-gray-800" key={idx}>
                    {item.name} x {item.quantity} <span className="text-gray-500">{item.size}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 mb-2 font-medium text-gray-900">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className="text-gray-600">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state}, {order.address.country},{' '}
                  {order.address.zipcode}
                </p>
                <p className="mt-1">{order.address.phone}</p>
              </div>
            </div>

            {/* Informações de pagamento */}
            <div className="space-y-1 text-gray-700">
              <p className="text-sm sm:text-base">Itens: {order.items.length}</p>
              <p>Método: {order.paymentMethod}</p>
              <p>Status do Pagamento: <span className={order.payment ? 'text-green-600 font-semibold' : 'text-red-500'}>{order.payment ? 'Pago' : 'Pendente'}</span></p>
              <p>Data: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            {/* Valor */}
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {currency}{order.amount}
            </div>

            {/* Status do pedido */}
            <div>
              <select
                onChange={(event) => atualizarStatusPedido(event, order._id)}
                value={order.orderStatus}
                className="w-full p-2 rounded-md border border-gray-300 bg-white text-sm sm:text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer transition"
              >
                <option value="Pedido Realizado">Pedido Realizado</option>
                <option value="Embalando">Embalando</option>
                <option value="Enviado">Enviado</option>
                <option value="Saiu para Entrega">Saiu para Entrega</option>
                <option value="Entregue">Entregue</option>
              </select>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Orders;
