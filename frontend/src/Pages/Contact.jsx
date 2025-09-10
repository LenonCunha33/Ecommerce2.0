import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Mail, MessageCircle, MapPin, Clock, ShieldCheck,
  Instagram, Facebook, Send
} from "lucide-react";
import Title from "../Components/Title";
import NewsLetterBox from "../Components/NewsLetterBox";
import { assets } from "../assets/assets";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

const Contact = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const COMPANY = {
    name: "Marima",
    city: "Volta Redonda - Rio de Janeiro",
    address: "Atendemos Toda Região Sul Fluminense",
    email: "suporte.marima.loja@gmail.com",
    phone: "+55 (24) 99999-9999",
    whatsapp:
      "https://wa.me/5524999999999?text=Olá,%20preciso%20de%20ajuda%20com%20meu%20pedido",
    chat: "#",
    instagram: "https://www.instagram.com/use.marima.ofc/",
    facebook:
      "https://www.facebook.com/people/Marima/61579379169198/?mibextid=wwXIfr&rdid=YebtqQjpTKdzlyPU&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FGBqEE2W3%2F%3Fmibextid%3DwwXIfr",
    hours: "Seg a Sex, 9h - 18h (exceto feriados)",
    sla: { whatsapp: "até 8h em horário comercial", email: "até 24h úteis", chat: "Imediato Quando Online" },
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7342.90487159465!2d-44.1073275!3d-22.5228476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f0227e6a11f%3A0x3c8f4a6f6d3e60c3!2sCentro%2C%20Volta%20Redonda%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1736440100000!5m2!1spt-BR!2sbr",
  };

  const faqs = [
    { question: "Qual o prazo de entrega?", answer: "O prazo varia conforme a região e modalidade. Em média, de 5 a 10 dias úteis após a confirmação do pagamento." },
    { question: "Posso devolver um produto?", answer: "Claro! Você tem até 7 dias corridos após o recebimento para solicitar devolução ou troca, conforme o CDC." },
    { question: "Quais formas de pagamento aceitam?", answer: "Cartões de Crédito (até 12x), Boleto Bancário e Carteiras Digitais." },
    { question: "Como falo com o suporte?", answer: `Atendemos por E-mail e Chat. Prazo médio de resposta: E-mail ${COMPANY.sla.email}, Chat ${COMPANY.sla.chat}.` },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSent(false);
    setError("");

    try {
      const formEl = e.currentTarget;
      const raw = Object.fromEntries(new FormData(formEl).entries());
      const payload = {
        name: raw.name?.trim(),
        email: raw.email?.trim(),
        subject: raw.subject?.trim(),
        orderId: raw.orderId?.trim(),
        message: raw.message?.trim(),
      };

      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Falha ao enviar. Tente novamente.");
      }

      setSent(true);
      formEl.reset();
    } catch (err) {
      setError(err.message || "Erro inesperado ao enviar sua mensagem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-5 sm:px-10 lg:px-20 pt-12 pb-28 border-t max-w-screen-xl mx-auto"
    >
      <div className="text-2xl mb-6">
        <Title text1="CONTATO" text2="CONOSCO" />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <a href={`mailto:${COMPANY.email}`} className="group rounded-xl border border-neutral-900/10 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer" aria-label="Contato por e-mail">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black p-2"><Mail className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">E-mail</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">{COMPANY.email}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Resposta {COMPANY.sla.email}</p>
        </a>

        <a href={COMPANY.chat} className="group rounded-xl border border-neutral-900/10 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer" aria-label="Abrir chat de atendimento">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black p-2"><MessageCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">Chat Online</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">Suporte em tempo real</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Disponível: {COMPANY.sla.chat}</p>
        </a>
      </section>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-10">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: 0.05 }} className="flex-1 w-full">
          <div className="flex flex-col gap-3 text-gray-700">
            <h3 className="font-semibold text-lg text-gray-900">Nossa Loja</h3>
            <p className="text-gray-600 leading-relaxed">
              {COMPANY.name} • {COMPANY.city}<br />{COMPANY.address}
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-900/10 bg-white p-4">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm font-medium">Endereço</span></div>
                <p className="mt-1 text-sm text-neutral-700">{COMPANY.address}</p>
              </div>
              <div className="rounded-lg border border-neutral-900/10 bg-white p-4">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm font-medium">Horário do Atendimeno</span></div>
                <p className="mt-1 text-sm text-neutral-700">{COMPANY.hours}<br />WhatsApp: {COMPANY.sla.whatsapp}<br />E-mail: {COMPANY.sla.email}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a href={COMPANY.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-lg border border-neutral-900/15 p-2 hover:bg-neutral-50 transition cursor-pointer"><Instagram className="h-5 w-5" /></a>
              <a href={COMPANY.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-lg border border-neutral-900/15 p-2 hover:bg-neutral-50 transition cursor-pointer"><Facebook className="h-5 w-5" /></a>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-900/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <ShieldCheck className="h-4 w-4" /> Suporte dedicado e política de trocas transparente.
            </div>
          </div>
        </motion.div>

        <motion.img initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: 0.1 }} src={assets.contact_img} alt="Entre em contato" className="w-full sm:w-1/2 max-w-md object-cover rounded-xl shadow-md" />
      </div>

      {/* Formulário — sem upload */}
      <section className="mt-16">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Envie uma mensagem</h3>
        <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-900/10 bg-white p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-neutral-800">Nome</label>
              <input id="name" name="name" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0" placeholder="Seu nome completo" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-neutral-800">E-mail</label>
              <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="voce@email.com" />
            </div>
            <div>
              <label htmlFor="subject" className="text-sm font-medium text-neutral-800">Assunto</label>
              <input id="subject" name="subject" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="Dúvida, suporte, parceria…" />
            </div>
            <div>
              <label htmlFor="orderId" className="text-sm font-medium text-neutral-800">Nº do pedido (opcional)</label>
              <input id="orderId" name="orderId" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="#12345" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="text-sm font-medium text-neutral-800">Mensagem</label>
              <textarea id="message" name="message" rows={5} required className="mt-1 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="Conte para nós como podemos ajudar" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-neutral-600">
              Ao enviar, você concorda com nossa{" "}
              <a href="/privacidade" className="underline underline-offset-2 hover:opacity-80">Política de Privacidade</a>.
            </p>

            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg border border-black bg-black px-4 py-2.5 text-sm font-bold text-white transition active:translate-y-[1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar mensagem"}
            </button>
          </div>

          <AnimatePresence>
            {sent && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-3 rounded-lg border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Recebemos sua mensagem! Responderemos em breve.
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-3 rounded-lg border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </section>

      <section id="faq" className="mt-16">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Perguntas Frequentes</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-neutral-900/10 bg-white p-4 shadow-sm">
              <button className="flex w-full items-center justify-between text-left font-medium text-neutral-800" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span>{faq.question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {COMPANY.mapEmbed && COMPANY.mapEmbed.length > 20 && (
        <section className="mt-16">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Conheça Nossa Região</h3>
          <div className="overflow-hidden rounded-xl border border-neutral-900/10">
            <iframe title="Mapa da loja" src={COMPANY.mapEmbed} className="h-64 w-full" loading="lazy" />
          </div>
        </section>
      )}

      <div className="mt-20"><NewsLetterBox /></div>
    </motion.div>
  );
};

export default Contact;
