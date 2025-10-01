// src/Pages/Login.jsx (ou onde ficar o seu componente)
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate do react-router
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate(); // ✅ função de navegação
  const { token, setToken, backendUrl } = useContext(ShopContext); // ❌ não pegar navigate do contexto
  const [currentState, setCurrentState] = useState("Entrar");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche automaticamente o e-mail vindo da newsletter
  useEffect(() => {
    const savedEmail = localStorage.getItem("newsletterEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      localStorage.removeItem("newsletterEmail");
    }
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let endpoint = "";
      let payload = {};

      if (isForgotPassword) {
        endpoint = "/api/user/forgot-password";
        payload = { email };
      } else if (currentState === "Cadastrar") {
        endpoint = "/api/user/register";
        payload = { name, email, password };
      } else {
        endpoint = "/api/user/login";
        payload = { email, password };
      }

      const { data } = await axios.post(backendUrl + endpoint, payload);

      if (data?.success) {
        if (isForgotPassword) {
          toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
          setIsForgotPassword(false);
          setCurrentState("Entrar");
          return;
        }

        const newToken = data?.data?.token || data?.token || data?.accessToken || "";
        if (!newToken) {
          toast.error("Token não retornado pelo servidor.");
          return;
        }

        setToken(newToken);
        localStorage.setItem("token", newToken);

        toast.success(
          currentState === "Cadastrar"
            ? "Cadastro realizado com sucesso!"
            : "Login realizado com sucesso!"
        );

        // ✅ Redireciona imediatamente para a dashboard
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(data?.message || "Não foi possível concluir a solicitação.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Erro ao processar solicitação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setName(value);
  };

  // ✅ Se já houver token (ex.: usuário logado acessa /login), envia para dashboard
  useEffect(() => {
    if (token && !isForgotPassword) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, isForgotPassword, navigate]);

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full px-6 py-10 mt-16 mx-auto bg-white rounded-lg shadow-md flex flex-col gap-5 text-gray-800"
    >
      {/* Título */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 self-start"
      >
        <h2 className="text-2xl font-semibold tracking-wide">
          {isForgotPassword
            ? "Recuperar Senha"
            : currentState === "Entrar"
            ? "Entrar"
            : "Cadastrar"}
        </h2>
        <hr className="h-[2px] w-10 bg-gray-800 border-none" />
      </motion.div>

      {/* Campos */}
      <div className="flex flex-col gap-4">
        {!isForgotPassword && currentState === "Cadastrar" && (
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Nome completo"
            className="input"
            required
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="input"
          required
        />

        {!isForgotPassword && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="input"
            required
          />
        )}
      </div>

      {/* Links */}
      <div className="flex justify-between text-sm text-gray-600">
        {!isForgotPassword && (
          <button
            type="button"
            className="hover:underline transition"
            onClick={() => {
              setIsForgotPassword(true);
              setCurrentState("Entrar");
            }}
          >
            Esqueceu a senha?
          </button>
        )}

        {!isForgotPassword && (
          <button
            type="button"
            onClick={() =>
              setCurrentState(currentState === "Entrar" ? "Cadastrar" : "Entrar")
            }
            className="hover:underline transition"
          >
            {currentState === "Entrar"
              ? "Criar uma conta"
              : "Já tenho uma conta"}
          </button>
        )}

        {isForgotPassword && (
          <button
            type="button"
            className="hover:underline transition"
            onClick={() => setIsForgotPassword(false)}
          >
            Voltar ao login
          </button>
        )}
      </div>

      {/* Botão */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={isSubmitting}
        className={`bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg w-full transition ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting
          ? "Enviando..."
          : isForgotPassword
          ? "Enviar E-mail de Recuperação"
          : currentState === "Entrar"
          ? "Entrar"
          : "Cadastrar"}
      </motion.button>
    </motion.form>
  );
};

export default Login;
