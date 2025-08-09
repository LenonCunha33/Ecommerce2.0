import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Privacidade() {
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === "A" && e.target.hash) {
        const id = e.target.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", `#${id}`);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const sectionVariant = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="max-w-6xl mx-auto p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl shadow-md p-6 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Política de Privacidade
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-700 max-w-lg">
                Esta política explica quais dados coletamos, por que coletamos e como você pode
                gerenciar, acessar e excluir esses dados.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <nav aria-label="Índice rápido" className="hidden md:block">
                <a
                  href="#conteudo"
                  className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  Ir para conteúdo
                </a>
              </nav>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="order-2 md:order-1 md:col-span-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="sticky top-6 bg-white p-4 rounded-2xl shadow-sm"
          >
            <h2 className="text-sm font-semibold mb-3">Índice</h2>
            <nav aria-label="Tabela de conteúdo" className="space-y-2 text-sm">
              <a href="#introducao" className="block hover:underline">Introdução</a>
              <a href="#dados-coletados" className="block hover:underline">Dados coletados</a>
              <a href="#uso-dados" className="block hover:underline">Uso dos dados</a>
              <a href="#cookies" className="block hover:underline">Cookies e rastreamento</a>
              <a href="#terceiros" className="block hover:underline">Compartilhamento com terceiros</a>
              <a href="#seguranca" className="block hover:underline">Segurança</a>
              <a href="#direitos" className="block hover:underline">Seus direitos</a>
              <a href="#retencao" className="block hover:underline">Período de retenção</a>
              <a href="#menores" className="block hover:underline">Menores de idade</a>
              <a href="#alteracoes" className="block hover:underline">Alterações nesta política</a>
              <a href="#contato" className="block hover:underline">Contato</a>
            </nav>
          </motion.div>
        </aside>

        <article id="conteudo" className="order-1 md:order-2 md:col-span-3">
          {[{
            id: "introducao",
            title: "1. Introdução",
            content: "Bem-vindo! Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você usa nosso site e serviços. Ao acessar ou utilizar os serviços, você concorda com a coleta e uso de informações conforme esta política."
          }, {
            id: "dados-coletados",
            title: "2. Dados que coletamos",
            content: "Dados de contato, uso, técnicos e de pagamento, conforme aplicável."
          }, {
            id: "uso-dados",
            title: "3. Como usamos seus dados",
            content: "Fornecer e melhorar serviços, comunicar, prevenir fraudes e cumprir obrigações legais."
          }, {
            id: "cookies",
            title: "4. Cookies e tecnologias de rastreamento",
            content: "Utilizamos cookies para lembrar preferências e personalizar a experiência."
          }, {
            id: "terceiros",
            title: "5. Compartilhamento com terceiros",
            content: "Podemos compartilhar dados com prestadores de serviços, autoridades e compradores."
          }, {
            id: "seguranca",
            title: "6. Segurança",
            content: "Adotamos medidas técnicas e administrativas para proteger seus dados."
          }, {
            id: "direitos",
            title: "7. Seus direitos",
            content: "Acessar, corrigir, excluir, portar dados e opor-se a certos tratamentos."
          }, {
            id: "retencao",
            title: "8. Período de retenção",
            content: "Reter dados apenas pelo tempo necessário ou exigido por lei."
          }, {
            id: "menores",
            title: "9. Menores de idade",
            content: "Serviços não destinados a menores; excluímos dados coletados inadvertidamente."
          }, {
            id: "alteracoes",
            title: "10. Alterações nesta política",
            content: "Podemos atualizar a política; mudanças relevantes serão comunicadas."
          }, {
            id: "contato",
            title: "11. Contato",
            content: "E-mail: contato@seudominio.com | Endereço: Rua Exemplo, 123 — Cidade, Estado"
          }].map((sec, i) => (
            <motion.section
              key={sec.id}
              id={sec.id}
              className="mb-8 bg-white p-6 rounded-2xl shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionVariant}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <h3 className="text-xl font-bold">{sec.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{sec.content}</p>
              {sec.id === "contato" && (
                <div className="mt-6 flex gap-3">
                  <a
                    href="#dados-coletados"
                    className="inline-block px-4 py-2 rounded-lg bg-black text-white font-medium shadow-sm hover:scale-[1.01] transition-transform"
                  >
                    Ver dados coletados
                  </a>
                  <a
                    href="#direitos"
                    className="inline-block px-4 py-2 rounded-lg border border-black text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Como exercer direitos
                  </a>
                </div>
              )}
            </motion.section>
          ))}
        </article>

        <div className="md:col-span-4 order-3">
          <div className="max-w-6xl mx-auto p-4 text-center text-xs text-gray-500">
            <p>Última atualização: 09 de Agosto de 2025</p>
          </div>
        </div>
      </main>
    </div>
  );
}
