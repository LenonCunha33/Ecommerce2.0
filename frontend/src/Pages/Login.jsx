import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [currentState, setCurrentState] = useState("Entrar");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Controle para recuperação de senha
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Preenche automaticamente o e-mail vindo da newsletter
  useEffect(() => {
    const savedEmail = localStorage.getItem("newsletterEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      localStorage.removeItem("newsletterEmail"); // limpa para não ficar persistente
    }
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
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

      const response = await axios.post(backendUrl + endpoint, payload);

      if (response.data.success) {
        if (isForgotPassword) {
          toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
          setIsForgotPassword(false);
          setCurrentState("Entrar");
        } else {
          const token = response.data.data.token;
          setToken(token);
          localStorage.setItem("token", token);
          toast.success(
            currentState === "Cadastrar"
              ? "Cadastro realizado com sucesso!"
              : "Login realizado com sucesso!"
          );
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Erro ao processar solicitação");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setName(value);
  };

  useEffect(() => {
    if (token && !isForgotPassword) {
      navigate("/");
    }
  }, [token]);

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
        className="bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg w-full transition"
      >
        {isForgotPassword
          ? "Enviar E-mail de Recuperação"
          : currentState === "Entrar"
          ? "Entrar"
          : "Cadastrar"}
      </motion.button>
    </motion.form>
  );
};

export default Login;
