import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../Components/dashboard/Sidebar";
import DadosPessoais from "../Components/dashboard/DadosPessoais";

import Pedidos from "../Components/dashboard/Pedidos";
import Carrinho from "../Components/dashboard/Carrinho";
import Cupons from "../Components/dashboard/Cupons";
import Devolucoes from "../Components/dashboard/Devolucoes";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dados");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // ou a chave que você usa para autenticação
    if (!token) {
      // Se não estiver logado, redireciona para login
      navigate("/login");
    }
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "dados":
        return <DadosPessoais />;

      case "pedidos":
        return <Pedidos />;
      case "carrinho":
        return <Carrinho />;
      case "cupons":
        return <Cupons />;
      case "devolucoes":
        return <Devolucoes />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
