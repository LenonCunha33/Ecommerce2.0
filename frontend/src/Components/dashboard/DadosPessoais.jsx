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
    promo: false
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (token) {
      axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
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
            promo: res.data.user.promo || false
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
        toast.success("Dados atualizados com sucesso!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao salvar alterações");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Dados Pessoais</h2>
      <div className="space-y-4">
        <input className="input" name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" />
        <input className="input" name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" />
        <input className="input" name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
        <input className="input" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp" />
        <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="E-mail" />
        <input className="input" type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="Nova senha" />
        <input className="input" name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF ou CNPJ" />
        <input className="input" type="date" name="nascimento" value={form.nascimento} onChange={handleChange} />
        <select className="input" name="sexo" value={form.sexo} onChange={handleChange}>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="promo" checked={form.promo} onChange={handleChange} />
          Quero receber e-mails com promoções
        </label>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full"
          onClick={handleSubmit}
        >
          Salvar Alterações
        </motion.button>
      </div>
    </div>
  );
}
