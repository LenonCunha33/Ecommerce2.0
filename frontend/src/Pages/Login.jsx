// src/Pages/Login.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

/** Imagens do slide (P&B de preferência) */
const SLIDES = [
  "https://res.cloudinary.com/drxiaawak/image/upload/v1759776312/2_w1wmdj.png",
  "https://res.cloudinary.com/drxiaawak/image/upload/v1759776314/1_tt0tk2.png",
  "https://res.cloudinary.com/drxiaawak/image/upload/v1759776316/4_tebbbk.png",
];

export default function Login() {
  const navigate = useNavigate();
  const { token, setToken, backendUrl } = useContext(ShopContext);

  // 'entrar' | 'cadastrar' | 'recuperar'
  const [mode, setMode] = useState("entrar");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const emailRef = useRef(null);

  // slide
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (SLIDES.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("newsletterEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      localStorage.removeItem("newsletterEmail");
    }
  }, []);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (token && mode !== "recuperar") {
      navigate("/dashboard", { replace: true });
    }
  }, [token, mode, navigate]);

  const title = useMemo(() => {
    if (mode === "cadastrar") return "Crie sua conta";
    if (mode === "recuperar") return "Recuperar senha";
    return "Entrar";
  }, [mode]);

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setName(value);
  };

  const validate = () => {
    if (!email.trim()) {
      toast.info("Informe um e-mail.");
      emailRef.current?.focus();
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.info("E-mail inválido.");
      emailRef.current?.focus();
      return false;
    }
    if (mode !== "recuperar") {
      if (!password.trim()) {
        toast.info("Informe a senha.");
        return false;
      }
      if (mode === "cadastrar" && password.length < 6) {
        toast.info("A senha deve ter pelo menos 6 caracteres.");
        return false;
      }
      if (mode === "cadastrar" && !name.trim()) {
        toast.info("Informe seu nome.");
        return false;
      }
      if (mode === "cadastrar" && !agree) {
        toast.info("É necessário aceitar os termos para continuar.");
        return false;
      }
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      let endpoint = "";
      let payload = {};

      if (mode === "recuperar") {
        endpoint = "/api/user/forgot-password";
        payload = { email };
      } else if (mode === "cadastrar") {
        endpoint = "/api/user/register";
        payload = { name, email, password };
      } else {
        endpoint = "/api/user/login";
        payload = { email, password };
      }

      const { data } = await axios.post(backendUrl + endpoint, payload);

      if (!data?.success) {
        toast.error(data?.message || "Não foi possível concluir a solicitação.");
        return;
      }

      if (mode === "recuperar") {
        toast.success("Enviamos as instruções para o seu e-mail.");
        setMode("entrar");
        return;
      }

      const newToken =
        data?.data?.token || data?.token || data?.accessToken || "";
      if (!newToken) {
        toast.error("Token não retornado pelo servidor.");
        return;
      }
      setToken(newToken);
      toast.success(
        mode === "cadastrar" ? "Cadastro realizado!" : "Login realizado!"
      );
      navigate("/outlet", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Erro ao processar solicitação"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSubmitHandler(e);
  };

  return (
    <div className="min-h-[calc(80dvh)] w-full bg-white text-black flex items-stretch justify-center px-2 sm:px-6 lg:px-8 py-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-7xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        {/* Grid: 1 coluna no mobile, 2 colunas a partir de lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Coluna da imagem */}
          <div className="bg-white">
            <div className="p-4 sm:p-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-white text-black border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 transition"
              >
                <span className="font-medium">Voltar ao site</span>
              </Link>
            </div>

            {/* === BLOCO AJUSTADO PARA MOBILE ===
                - Mobile: aspecto fixo (3/4) -> container estável
                - Desktop (≥lg): altura fixa como antes
                - Imagem: object-contain (mostra a foto inteira), sem mudar o container */}
            <div className="px-4 sm:px-6 pb-6">
              <div
                className="
                  relative w-full mx-auto bg-white ring-1 ring-black/5 overflow-hidden
                  rounded-3xl lg:rounded-2xl
                  aspect-[3/4]   /* altura estável no mobile */
                  lg:aspect-auto lg:h-[720px]  /* desktop mantém como estava */
                "
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={SLIDES[idx] || 'placeholder'}
                    src={SLIDES[idx]}
                    alt="Slide"
                    draggable={false}
                    initial={{ opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.45 }}
                    className="
                      absolute inset-0 w-full h-full select-none
                      object-cover  /* foto inteira no mobile */
                      rounded-3xl lg:rounded-none
                    "
                  />
                </AnimatePresence>

                {SLIDES.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`h-1.5 w-8 rounded-full transition ${
                          i === idx ? "bg-black" : "bg-black/25"
                        }`}
                        aria-label={`Ir para o slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna do formulário (inalterada) */}
          <div className="bg-white flex items-center">
            <div className="w-full px-4 sm:px-8 py-8 sm:py-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="mb-7 sm:mb-9"
              >
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {title}
                </h1>

                {mode !== "recuperar" ? (
                  <p className="text-sm text-black/60 mt-2">
                    {mode === "cadastrar" ? (
                      <>
                        Já tem uma conta?{" "}
                        <button
                          className="underline underline-offset-2 hover:text-black"
                          onClick={() => setMode("entrar")}
                          type="button"
                        >
                          Entrar
                        </button>
                      </>
                    ) : (
                      <>
                        Ainda não tem conta?{" "}
                        <button
                          className="underline underline-offset-2 hover:text-black"
                          onClick={() => setMode("cadastrar")}
                          type="button"
                        >
                          Cadastre-se
                        </button>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-black/60 mt-2">
                    Lembrou a senha?{" "}
                    <button
                      className="underline underline-offset-2 hover:text-black"
                      onClick={() => setMode("entrar")}
                      type="button"
                    >
                      Voltar ao login
                    </button>
                  </p>
                )}
              </motion.div>

              <motion.form
                onSubmit={onSubmitHandler}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="space-y-5"
              >
                {mode === "cadastrar" && (
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className="peer w-full rounded-xl bg-white text-black placeholder-transparent border border-black/15 focus:border-black/60 outline-none px-4 py-3 transition"
                      placeholder="Nome completo"
                      autoComplete="name"
                      aria-label="Nome completo"
                      required
                    />
                    <label
                      htmlFor="name"
                      className="pointer-events-none absolute left-4 top-3 text-black/50 transition-all peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-black"
                    >
                      Nome completo
                    </label>
                  </div>
                )}

                <div className="relative">
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="peer w-full rounded-xl bg-white text-black placeholder-transparent border border-black/15 focus:border-black/60 outline-none px-4 py-3 transition"
                    placeholder="E-mail"
                    autoComplete="email"
                    aria-label="E-mail"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-4 top-3 text-black/50 transition-all peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-black"
                  >
                    E-mail
                  </label>
                </div>

                {mode !== "recuperar" && (
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        setCapsLockOn(
                          e.getModifierState && e.getModifierState("CapsLock")
                        );
                        handleKeyDown(e);
                      }}
                      className="peer w-full rounded-xl bg-white text-black placeholder-transparent border border-black/15 focus:border-black/60 outline-none px-4 py-3 transition pr-16"
                      placeholder="Senha"
                      autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                      aria-label="Senha"
                      required
                    />
                    <label
                      htmlFor="password"
                      className="pointer-events-none absolute left-4 top-3 text-black/50 transition-all peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-black"
                    >
                      Senha
                    </label>

                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition px-2 py-1 rounded-md"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>

                    <AnimatePresence>
                      {capsLockOn && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-2 text-xs text-black/60"
                        >
                          Caps Lock está ativado.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {mode === "cadastrar" && (
                  <label className="flex items-center gap-3 text-sm text-black/80 select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="h-4 w-4 rounded border-black/40 bg-white"
                    />
                    Concordo com os{" "}
                    <span className="underline underline-offset-2">Termos & Condições</span>
                  </label>
                )}

                {mode === "entrar" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode("recuperar")}
                      className="text-sm text-black/60 hover:text-black underline underline-offset-2"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-4 py-3 font-medium border transition focus:outline-none focus:ring-2 focus:ring-black/30 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed bg-white text-black border-black/20"
                      : "bg-white text-black border-black/20 hover:bg-black/5"
                  }`}
                >
                  {isSubmitting
                    ? "Enviando..."
                    : mode === "recuperar"
                    ? "Enviar e-mail de recuperação"
                    : mode === "cadastrar"
                    ? "Criar conta"
                    : "Entrar"}
                </motion.button>
              </motion.form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
