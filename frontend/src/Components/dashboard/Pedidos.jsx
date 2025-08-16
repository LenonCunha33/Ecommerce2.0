import { useContext, useEffect, useState } from "react";
import Title from "../../Components/Title";
import { ShopContext } from "../../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function Pedidos() {
  const { currency, backendUrl, token } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const fetchOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrderItem = [];
        response.data.orders.forEach((order) => {
          // Filtra ordens que não estão finalizadas
          if (order.orderStatus !== "Finalizado") {
            order.items.forEach((item) => {
              item.orderStatus = order.orderStatus;
              item.payment = order.payment;
              item.paymentMethod = order.paymentMethod;
              item.date = order.date;
              allOrderItem.push(item);
            });
          }
        });
        setOrderData(allOrderItem);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao carregar pedidos");
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [token]);

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("pt-BR", options);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-16 px-4 sm:px-6 lg:px-10 border-t max-w-screen-xl mx-auto"
    >
      <div className="mb-6 text-2xl">
        <Title text1="MEUS" text2="PEDIDOS" />
      </div>

      {orderData.length === 0 ? (
        <p className="text-gray-500 text-lg">Você não tem pedidos ainda.</p>
      ) : (
        <div className="space-y-6">
          {orderData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white"
            >
              {/* Detalhes do Pedido */}
              <div className="flex gap-5">
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div className="text-gray-700 space-y-1 text-sm sm:text-base">
                  <p className="font-medium text-base">{item.name}</p>
                  <div className="flex flex-wrap gap-3 text-gray-600">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Qtd: {item.quantity}</p>
                    <p>Tam: {item.size}</p>
                  </div>
                  <p>
                    Data:{" "}
                    <span className="text-gray-400">
                      {formatDate(item.date)}
                    </span>
                  </p>
                  <p>
                    Pagamento:{" "}
                    <span className="text-gray-400">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              {/* Status + Botão */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full md:w-auto gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <p className="text-sm text-gray-700 font-medium">
                    {item.orderStatus}
                  </p>
                </div>
                <button
                  onClick={fetchOrderData}
                  className="border text-sm font-medium px-5 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Rastrear Pedido
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
