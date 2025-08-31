import { useContext, useEffect, useState } from "react";
import Title from "../../Components/Title";
import { ShopContext } from "../../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Package, CreditCard, Calendar, ShoppingBag } from "lucide-react";

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

  // Variantes para animações em cascata
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pt-16 px-4 sm:px-6 lg:px-10 border-t max-w-screen-xl mx-auto"
    >
      {/* SEO-friendly heading */}
      <header className="mb-8">
        <h1 className="sr-only">Histórico de Pedidos do Cliente</h1>
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
          <Title text1="Meus" text2="Pedidos" />
        </div>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-lg">
          Consulte o status atualizado dos seus pedidos, acompanhe entregas e
          detalhes de pagamento de forma prática e segura.
        </p>
      </header>

      {orderData.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 text-lg mt-10 text-center"
        >
          Você ainda não possui pedidos em andamento. Explore nossa loja e faça
          sua primeira compra!
        </motion.p>
      ) : (
        <motion.div
          variants={containerVariants}
          className="space-y-6 md:space-y-8"
        >
          {orderData.map((item, index) => (
            <motion.article
              key={index}
              variants={itemVariants}
              className="border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6"
              aria-label={`Pedido do produto ${item.name}`}
            >
              {/* Produto */}
              <div className="flex gap-4 md:gap-6 w-full md:w-auto">
                <img
                  src={item.image[0]}
                  alt={`Imagem do produto ${item.name}`}
                  className="w-24 h-24 object-cover rounded-xl shadow-sm"
                  loading="lazy"
                />

                <div className="space-y-2 text-sm sm:text-base">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={16} /> {item.name}
                  </p>
                  <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Qtd: {item.quantity}</p>
                    <p>Tam: {item.size}</p>
                  </div>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} /> {formatDate(item.date)}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <CreditCard size={14} /> {item.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Status + Ações */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item.orderStatus === "Pendente"
                        ? "bg-yellow-500"
                        : item.orderStatus === "Enviado"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  ></span>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <Package size={14} /> {item.orderStatus}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchOrderData}
                  aria-label={`Rastrear pedido de ${item.name}`}
                  className="border px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Rastrear Pedido
                </motion.button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
