import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User,
  Package,
  ShoppingCart,
  RefreshCcw,
  LogOut,
  Menu,
  X,
} from "lucide-react"; // ícones leves para SEO e acessibilidade

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // sidebar colapsável em telas menores
  const [isMobile, setIsMobile] = useState(false);

  // Responsividade → detecta tela menor que 768px
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "dados", label: "Dados Pessoais", icon: <User size={18} /> },
    { id: "pedidos", label: "Pedidos", icon: <Package size={18} /> },
    { id: "carrinho", label: "Carrinho", icon: <ShoppingCart size={18} /> },
    { id: "devolucoes", label: "Devoluções", icon: <RefreshCcw size={18} /> },
  ];

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  // Variantes de animação fluida
  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { x: -280, opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <>
      {/* Botão de toggle no mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          className="fixed top-4 mt-15 left-4 z-50 p-2 rounded-lg bg-black text-white shadow-md hover:scale-105 transition-transform"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <motion.aside
            key="sidebar"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="w-64 md:w-60 lg:w-64 border-r border-gray-200 p-4 flex flex-col h-full bg-white fixed md:static top-0 left-0 z-40 md:z-auto shadow-lg md:shadow-none"
            aria-label="Painel de controle do cliente"
          >
            {/* Cabeçalho */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-extrabold text-xl mb-8 text-gray-900 select-none tracking-tight"
            >
              Painel do Cliente
            </motion.h2>

            {/* Navegação */}
            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.04, x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setIsOpen(false);
                  }}
                  aria-label={`Acessar seção ${item.label}`}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                    activeTab === item.id
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </nav>

            {/* Botão sair */}
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "#111", color: "#fff" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              aria-label="Encerrar sessão"
              className="mt-6 w-full flex items-center gap-3 px-4 py-2 border border-gray-800 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <LogOut size={18} />
              Sair
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
