import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function User() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);

  // Pega token do usuário logado (não apenas admin)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get(`${backendUrl}/api/user/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          if (res.data.success) {
            setUsers(res.data.users);
          } else {
            toast.error("Erro ao carregar usuários");
          }
        })
        .catch(() => toast.error("Erro de conexão com o servidor"));
    } else {
      toast.error("Você precisa estar logado para ver esta página");
    }
  }, [token, backendUrl]);

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800">
      <motion.h1
        className="text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Usuários Cadastrados
      </motion.h1>

      <motion.div
        className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-4 text-left font-semibold">Nome</th>
              <th className="py-3 px-4 text-left font-semibold">Email</th>
              <th className="py-3 px-4 text-left font-semibold">Celular</th>
              <th className="py-3 px-4 text-left font-semibold">WhatsApp</th>
              <th className="py-3 px-4 text-left font-semibold">CPF/CNPJ</th>
              <th className="py-3 px-4 text-left font-semibold">Nascimento</th>
              <th className="py-3 px-4 text-left font-semibold">Sexo</th>
              <th className="py-3 px-4 text-left font-semibold">Promoções</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <motion.tr
                  key={user._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-3 px-4">{user.name || "-"}</td>
                  <td className="py-3 px-4">{user.email || "-"}</td>
                  <td className="py-3 px-4">{user.celular || "-"}</td>
                  <td className="py-3 px-4">{user.whatsapp || "-"}</td>
                  <td className="py-3 px-4">{user.cpf || "-"}</td>
                  <td className="py-3 px-4">{user.nascimento || "-"}</td>
                  <td className="py-3 px-4 capitalize">{user.sexo || "-"}</td>
                  <td className="py-3 px-4">{user.promo ? "Sim" : "Não"}</td>
                </motion.tr>
              ))
            ) : (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Nenhum usuário encontrado
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
