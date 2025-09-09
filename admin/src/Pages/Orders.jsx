import { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  const statusOpcoes = [
    'Todos',
    'Pedido Realizado',
    'Embalando',
    'Enviado',
    'Saiu para Entrega',
    'Entregue',
    'Finalizado',
  ];

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

  // pede dados de rastreio quando status === "Enviado"
  const solicitarRastreio = async () => {
    const trackingCode = window.prompt('Código de rastreio (ex: LX123456789BR):') || '';
    const carrier = window.prompt('Transportadora (ex: Correios, Jadlog, etc):') || '';
    // se o user cancelar ambos prompts, volta vazio (ok)
    return { trackingCode: trackingCode.trim(), carrier: carrier.trim() };
  };

  const atualizarStatusPedido = async (event, order) => {
    const novoStatus = event.target.value;

    try {
      let payload = { orderId: order._id, orderStatus: novoStatus };

      // se for "Enviado", coletar opcionalmente tracking e transportadora
      if (novoStatus === 'Enviado') {
        const { trackingCode, carrier } = await solicitarRastreio();
        if (trackingCode) payload.trackingCode = trackingCode;
        if (carrier) payload.carrier = carrier;
      }

      const response = await axios.post(
        backendUrl + '/api/order/status',
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        await buscarPedidos();
        toast.success('Status atualizado com sucesso!');
      } else {
        toast.error(response.data.message || 'Não foi possível atualizar o status.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erro ao atualizar status.');
    }
  };

  useEffect(() => {
    buscarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pedidosFiltrados =
    statusFiltro === 'Todos'
      ? orders
      : orders.filter((order) => order.orderStatus === statusFiltro);

  // Variants para animação escalonada
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, ease: 'easeOut' },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section
      className="px-4 sm:px-6 md:px-12 mt-10 lg:px-20 py-10 max-w-7xl mx-auto"
      aria-label="Lista de pedidos recentes"
    >
      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 text-center text-gray-900 tracking-tight"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Acompanhe Seus Pedidos em Tempo Real
      </motion.h1>

      {/* Barra de filtros */}
      <motion.div
        className="flex flex-wrap gap-3 justify-center mb-10"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {statusOpcoes.map((status) => (
          <motion.button
            key={status}
            onClick={() => setStatusFiltro(status)}
            aria-label={`Filtrar por ${status}`}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium border transition-all duration-300 ${
              statusFiltro === status
                ? 'bg-gradient-to-r from-black to-gray-800 text-white border-black shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black'
            }`}
          >
            {status}
          </motion.button>
        ))}
      </motion.div>

      {/* Lista de pedidos */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {pedidosFiltrados.length === 0 ? (
          <motion.p
            className="text-center text-gray-500 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nenhum pedido encontrado para este status.
          </motion.p>
        ) : (
          pedidosFiltrados.map((order, index) => (
            <motion.article
              key={index}
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border border-gray-200 rounded-2xl shadow-md bg-white p-4 sm:p-6 text-xs sm:text-sm text-gray-700 hover:shadow-lg transition"
            >
              {/* Ícone */}
              <div className="flex justify-center items-start">
                <img
                  className="w-10 sm:w-12"
                  src={assets.parcel_icon}
                  alt="Ícone ilustrativo de pacote"
                />
              </div>

              {/* Itens e endereço */}
              <div>
                <div className="mb-2">
                  {order.items.map((item, idx) => (
                    <p className="text-gray-800" key={idx}>
                      {item.name} x {item.quantity}{' '}
                      <span className="text-gray-500">({item.size})</span>
                    </p>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-medium text-gray-900">
  {order.address.firstName} {order.address.lastName}
</p>
<div className="text-gray-600 leading-snug space-y-1">
  {order.address.email && <p>Email: {order.address.email}</p>}
  {order.address.phone && <p>Telefone: {order.address.phone}</p>}
  {order.address.street && (
    <p>
      {order.address.street}
      {order.address.number ? `, Nº ${order.address.number}` : ""}
      {order.address.complement ? `, ${order.address.complement}` : ""}
    </p>
  )}
  {order.address.neighborhood && <p>Bairro: {order.address.neighborhood}</p>}
  <p>
    {order.address.city}, {order.address.state}, {order.address.country} - {order.address.zipcode}
  </p>
</div>
              </div>

              {/* Informações de pagamento */}
              <div className="space-y-1 text-gray-700">
                <p className="text-sm sm:text-base">Itens: {order.items.length}</p>
                <p>Método: {order.paymentMethod}</p>
                <p>
                  Status do Pagamento:{' '}
                  <span
                    className={
                      order.payment ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'
                    }
                  >
                    {order.payment ? 'Pago' : 'Pendente'}
                  </span>
                </p>
                <p>Data: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              {/* Valor */}
              <div className="font-semibold text-sm sm:text-base text-gray-900">
                {currency}
                {order.amount}
              </div>

              {/* Status do pedido */}
              <div>
                <select
                  onChange={(event) => atualizarStatusPedido(event, order)}
                  value={order.orderStatus}
                  aria-label={`Alterar status do pedido ${order._id}`}
                  className="w-full p-2 rounded-lg border border-gray-300 bg-white text-sm sm:text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer transition"
                >
                  <option value="Pedido Realizado">Pedido Realizado</option>
                  <option value="Embalando">Embalando</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Saiu para Entrega">Saiu para Entrega</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Finalizado">Finalizado</option>
                </select>

                {/* Mostra infos de rastreio se existirem */}
                {(order.trackingCode || order.carrier) && (
                  <div className="mt-2 text-[11px] sm:text-xs text-gray-600">
                    {order.trackingCode && (
                      <p>
                        <span className="font-medium">Rastreio:</span> {order.trackingCode}
                      </p>
                    )}
                    {order.carrier && (
                      <p>
                        <span className="font-medium">Transportadora:</span> {order.carrier}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          ))
        )}
      </motion.div>
    </section>
  );
};

export default Orders;
