import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = ({ setToken }) => {
  const [email, seteMail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        email,
        password,
      });

      const token = response.data?.data?.token;

      if (response.data.success) {
        setToken(token);
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao realizar login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-10">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* SEO Heading */}
        <motion.h1
          className="text-3xl font-extrabold text-gray-900 mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Login Administrativo Seguro
        </motion.h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Acesse o <span className="font-semibold">Painel de Gestão</span> com segurança e rapidez
        </p>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-5">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Endereço de e-mail
            </label>
            <motion.input
              id="email"
              type="email"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => seteMail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-gray-800"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Senha
            </label>
            <motion.input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-gray-800"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold shadow-md hover:bg-gray-800 transition duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Entrar no Painel
          </motion.button>
        </form>

        {/* Info */}
        <motion.p
          className="text-center text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          🔒 Acesso restrito exclusivamente a administradores autorizados
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
