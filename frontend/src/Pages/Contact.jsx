"use client";
import { assets } from "../assets/assets";
import NewsLetterBox from "../Components/NewsLetterBox";
import Title from "../Components/Title";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Contact = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  // Perguntas Frequentes
  const faqs = [
    {
      question: "Qual o prazo de entrega?",
      answer:
        "O prazo varia de acordo com a região. Normalmente, entregamos entre 5 a 10 dias úteis após a confirmação do pagamento.",
    },
    {
      question: "Posso devolver um produto?",
      answer:
        "Sim! Você tem até 7 dias corridos após o recebimento para solicitar devolução ou troca, conforme o Código de Defesa do Consumidor.",
    },
    {
      question: "Quais formas de pagamento aceitam?",
      answer:
        "Aceitamos Pix, Cartões de Crédito (até 12x), Boleto Bancário e Carteiras Digitais.",
    },
    {
      question: "Como falo com o suporte?",
      answer:
        "Nosso suporte está disponível por E-mail. Respondemos em até 24h úteis E-mail",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-5 sm:px-10 lg:px-20 pt-12 pb-28 border-t max-w-screen-xl mx-auto"
    >
      {/* Título */}
      <div className="text-2xl mb-6">
        <Title text1="CONTATO" text2="CONOSCO" />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col-reverse sm:flex-row items-center gap-12">
        {/* Lado Esquerdo: Informações */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 text-gray-700 w-full sm:w-1/2"
        >
          <h3 className="font-semibold text-lg text-gray-800">Nossa Loja</h3>
          <p className="text-gray-500 leading-relaxed">
            Totalmente Digital <br />
            Fundada em Volta Redonda - Rio de Janeiro
          </p>

          <p>
            Email:{" "}
            <a
              href="mailto:suporte.marima.loja@gmail.com"
              className="text-gray-500 hover:text-black"
            >
              suporte.marima.loja@gmail.com
            </a>
          </p>

          {/* Canais rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
            <a
              href="mailto:suporte.marima.loja@gmail.com"
              className="border rounded-lg p-3 text-center hover:bg-blue-100 transition"
            >
              E-mail
            </a>
          </div>
        </motion.div>

        {/* Lado Direito: Imagem */}
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          src={assets.contact_img}
          alt="Contato"
          className="w-full sm:w-1/2 max-w-md object-cover rounded-lg shadow-md"
        />
      </div>

      {/* FAQ */}
      <div id="faq" className="mt-20">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Perguntas Frequentes
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <button
                className="flex justify-between items-center w-full text-left font-medium text-gray-700"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                {faq.question}
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-gray-500 text-sm leading-relaxed"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-20">
        <NewsLetterBox />
      </div>
    </motion.div>
  );
};

export default Contact;
