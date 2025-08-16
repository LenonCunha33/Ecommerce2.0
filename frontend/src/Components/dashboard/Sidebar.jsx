import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dados", label: "Dados Pessoais" },
    
    { id: "pedidos", label: "Pedidos" },
    { id: "carrinho", label: "Carrinho" },
    //{ id: "cupons", label: "Cupons" },
    { id: "devolucoes", label: "Devoluções" },
  ];

  function handleLogout() {
    // Limpa o localStorage ou qualquer outro storage que use para autenticação
    localStorage.clear();
    // Redireciona para página de login
    navigate("/login");
  }

  return (
    <aside
      className="w-64 border-r border-gray-200 p-4 flex flex-col h-full bg-white"
      aria-label="Menu lateral do cliente"
    >
      <h2 className="font-semibold text-lg mb-6 text-gray-800 select-none">
        Painel de Usuário
      </h2>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(item.id)}
            aria-label={`Ir para ${item.label}`}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
              activeTab === item.id
                ? "bg-black text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </motion.button>
        ))}
      </nav>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        aria-label="Sair da conta"
        className="mt-6 w-full px-4 py-2 border border-gray-800 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-800 hover:text-white transition-colors duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        Sair
      </motion.button>
    </aside>
  );
}
