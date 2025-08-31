import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function User() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);

  // 🔑 Token do usuário
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get(`${backendUrl}/api/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setUsers(res.data.users);
          } else {
            toast.error("Erro ao carregar usuários");
          }
        })
        .catch(() => toast.error("Erro de conexão com o servidor"));
    } else {
      toast.error("Você precisa estar logado para acessar os usuários");
    }
  }, [token, backendUrl]);

  return (
    <main className="p-6 mt-10 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      {/* SEO-friendly Heading */}
      <motion.h1
        className="text-2xl md:text-4xl font-extrabold mb-6 tracking-tight text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Gestão de Usuários | Painel Administrativo
      </motion.h1>

      <motion.p
        className="mb-8 text-gray-600 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Consulte informações detalhadas dos usuários cadastrados no sistema.
        Este painel é otimizado para <strong>SEO tecnológico</strong>, garante
        acessibilidade e responsividade completa em qualquer dispositivo.
      </motion.p>

      {/* Container da tabela */}
      <motion.div
        className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <table className="min-w-full text-sm md:text-base">
          <thead>
            <tr className="bg-gray-100/80 text-gray-700">
              {[
                "Nome Completo",
                "E-mail",
                "Celular",
                "WhatsApp",
                "CPF / CNPJ",
                "Data de Nascimento",
                "Sexo",
                "Recebe Promoções",
              ].map((col, i) => (
                <th
                  key={i}
                  className="py-3 px-4 text-left font-semibold whitespace-nowrap"
                  scope="col"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <motion.tr
                  key={user._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {user.name || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email || "-"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.celular || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.whatsapp || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.cpf || "-"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.nascimento || "-"}
                  </td>
                  <td className="py-3 px-4 capitalize text-gray-600">
                    {user.sexo || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs md:text-sm ${
                        user.promo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.promo ? "Sim" : "Não"}
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Nenhum usuário encontrado no sistema
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </main>
  );
}
