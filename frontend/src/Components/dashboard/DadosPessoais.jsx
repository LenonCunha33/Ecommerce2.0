import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-toastify";

export default function DadosPessoais() {
  const { backendUrl, token } = useContext(ShopContext);
  const [form, setForm] = useState({
    nome: "",
    celular: "",
    telefone: "",
    whatsapp: "",
    email: "",
    senha: "",
    cpf: "",
    nascimento: "",
    sexo: "masculino",
    promo: false,
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (token) {
      axios
        .get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setForm({
              nome: res.data.user.name || "",
              celular: res.data.user.celular || "",
              telefone: res.data.user.telefone || "",
              whatsapp: res.data.user.whatsapp || "",
              email: res.data.user.email || "",
              senha: "",
              cpf: res.data.user.cpf || "",
              nascimento: res.data.user.nascimento || "",
              sexo: res.data.user.sexo || "masculino",
              promo: res.data.user.promo || false,
            });
          }
        })
        .catch(() => toast.error("Erro ao carregar dados"));
    }
  }, [token, backendUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("✅ Dados atualizados com sucesso!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao salvar alterações");
    }
  };

  // Animação em cascata
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto px-6 py-12"
    >
      {/* SEO heading */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl font-extrabold text-gray-900 mb-8 text-center"
      >
        Atualize seus Dados Pessoais
      </motion.h2>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 space-y-6 border border-gray-100"
      >
        {/* Campos */}
        <motion.div variants={containerVariants} className="space-y-5">
          {[
            { name: "nome", placeholder: "Nome completo" },
            { name: "celular", placeholder: "Celular" },
            { name: "telefone", placeholder: "Telefone" },
            { name: "whatsapp", placeholder: "WhatsApp" },
            { name: "email", placeholder: "E-mail", type: "email" },
            { name: "senha", placeholder: "Nova senha", type: "password" },
            { name: "cpf", placeholder: "CPF ou CNPJ" },
            { name: "nascimento", type: "date" },
          ].map((field, idx) => (
            <motion.input
              key={idx}
              variants={itemVariants}
              type={field.type || "text"}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              aria-label={field.placeholder}
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
            />
          ))}

          {/* Select sexo */}
          <motion.select
            variants={itemVariants}
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            aria-label="Selecione seu sexo"
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
          >
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </motion.select>

          {/* Checkbox */}
          <motion.label
            variants={itemVariants}
            className="flex items-center gap-3 text-gray-700 cursor-pointer"
          >
            <input
              type="checkbox"
              name="promo"
              checked={form.promo}
              onChange={handleChange}
              className="w-4 h-4 accent-black"
            />
            Quero receber e-mails com promoções exclusivas
          </motion.label>
        </motion.div>

        {/* Botão */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="w-full bg-black text-white font-semibold py-3 rounded-lg shadow-md hover:bg-gray-900 transition"
        >
          Salvar Alterações
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
