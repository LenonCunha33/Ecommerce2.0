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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        currentState === "Cadastrar"
          ? "/api/user/register"
          : "/api/user/login";

      const payload =
        currentState === "Cadastrar"
          ? { name, email, password }
          : { email, password };

      const response = await axios.post(backendUrl + endpoint, payload);

      const token = response.data.data.token;
      if (response.data.success) {
        setToken(token);
        localStorage.setItem("token", token);
        toast.success(
          currentState === "Cadastrar"
            ? "Cadastro realizado com sucesso!"
            : "Login realizado com sucesso!"
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Erro ao autenticar");
    }
  };

  useEffect(() => {
    if (token) {
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
      {/* Título com linha animada */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 self-start"
      >
        <h2 className="text-2xl font-semibold tracking-wide">{currentState}</h2>
        <hr className="h-[2px] w-10 bg-gray-800 border-none" />
      </motion.div>

      {/* Campos de entrada */}
      <div className="flex flex-col gap-4">
        {currentState === "Cadastrar" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="input"
          required
        />
      </div>

      {/* Links de ação */}
      <div className="flex justify-between text-sm text-gray-600">
        <button
          type="button"
          className="hover:underline transition"
          onClick={() => toast.info("Função de recuperação ainda não implementada")}
        >
          Esqueceu a senha?
        </button>

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
      </div>

      {/* Botão principal */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg w-full transition"
      >
        {currentState === "Entrar" ? "Entrar" : "Cadastrar"}
      </motion.button>
    </motion.form>
  );
};

export default Login;
