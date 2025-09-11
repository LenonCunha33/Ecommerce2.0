"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import Title from "../Components/Title";
import NewsLetterBox from "../Components/NewsLetterBox";
import {
  Shield,
  Lock,
  CreditCard,
  Truck,
  RefreshCcw,
  UserCheck,
  MapPin,
  FileText,
  Award,
} from "lucide-react";

/* ------------------------- animações reutilizáveis ------------------------ */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.45, delay },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.4, delay },
});

/* ------------------------- imagem com fallback seguro --------------------- */
function SafeImage({ src, alt, className }) {
  const [broken, setBroken] = useState(false);
  const placeholder =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'>
        <defs><linearGradient id='g' x1='0' x2='1'>
          <stop stop-color='#f6f6f6' offset='0'/><stop stop-color='#e9e9e9' offset='1'/>
        </linearGradient></defs>
        <rect width='1200' height='800' fill='url(#g)'/>
        <text x='50%' y='50%' text-anchor='middle' fill='#9ca3af' font-size='36' font-family='Arial' dy='.3em'>
          imagem indisponível
        </text>
      </svg>`
    );

  return (
    <img
      src={broken ? placeholder : src}
      alt={alt}
      onError={() => setBroken(true)}
      loading="lazy"
      className={className}
    />
  );
}

const About = () => {
  /* ------------------------ conteúdo de demonstração ----------------------- */
  const COMPANY = {
    name: "Marima",
    segment: "Moda Fitness",
    slogan: "Qualidade, conforto e transparência em cada pedido.",
    cnpj: "49.819.457/0001-11",
    address: "Região Sul Fluminense — Centro, Volta Redonda/RJ",
    email: "contato.marima.suporte@gmail.com",
    whatsapp: "https://wa.me/5524999999999",
    founded: "2025",
    clients: "100+ clientes atendidos",
    shippingTime: "Região Sul Fluminense toda em 2-7 dias úteis",
  };

  const values = [
    {
      title: "Transparência",
      desc: "Políticas claras, comunicação direta e acompanhamento do pedido.",
    },
    {
      title: "Qualidade",
      desc: "Curadoria com foco em tecnologia têxtil, caimento e durabilidade.",
    },
    {
      title: "Atendimento",
      desc: "Suporte ágil em todos os canais.",
    },
  ];

  const policies = [
    {
      icon: <RefreshCcw className="h-5 w-5" />,
      title: "Troca & Devolução",
      desc: "Até 7 dias corridos após o recebimento (CDC).",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Privacidade",
      desc: "Seus dados tratados com sigilo e segurança (LGPD).",
    },
    {
      icon: <Truck className="h-5 w-5" />,
      title: "Envio Rápido",
      desc: COMPANY.shippingTime,
    },
  ];

  const trust = [
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Site seguro (SSL)",
      desc: "Criptografia em toda a navegação.",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Pagamentos confiáveis",
      desc: "Cartão, Boleto e Carteiras Digitais.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Compra protegida",
      desc: "Boas práticas antifraude e estorno.",
    },
  ];

  const timeline = [
    { year: "Ago/2025", text: "Lançamento do e-commerce com linha essencial." },
    { year: "Set/2025", text: "Nova plataforma com UX otimizada e entregas mais rápidas." },
    { year: "Set/2025", text: "Em Breve... Novo Lançamento Drop Casual Linha Premium." },
    
  ];

  const testimonials = [
    {
      name: "Angell Carius",
      text: "Peças excelentes e entrega super rápida. Atendimento impecável!",
      when: "Set/2025",
    },
    {
      name: "Gisele Souza",
      text: "Compra fácil, recebi atualizações do pedido e chegou antes do prazo.",
      when: "Out/2025",
    },
    {
      name: "Mariana Alonso",
      text: "Qualidade top e troca sem burocracia. Vou comprar de novo!",
      when: "Out/2025",
    },
  ];

  return (
    <div className="px-5 sm:px-10 lg:px-20 max-w-screen-xl mx-auto py-12 space-y-20 text-neutral-800">
      {/* ------------------------------- HERO -------------------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center">
          <Title text1="SOBRE" text2="NÓS" />
          <p className="mt-4 text-sm sm:text-base max-w-2xl mx-auto text-neutral-600">
            A <span className="font-semibold text-neutral-900">{COMPANY.name}</span> é um e-commerce de {COMPANY.segment}.
            Nossa promessa é simples: <strong>produtos de alta qualidade</strong>, experiência de compra fluida e
            <strong> comunicação transparente</strong> do início ao fim.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* imagem segura + proporção fixa para evitar “salto” de layout */}
          <motion.div {...fadeIn(0.05)} className="relative w-full">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
              <SafeImage
                src={assets.about_img}
                alt="Bastidores e curadoria de produtos"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-900">{COMPANY.slogan}</h3>
            <p className="text-neutral-700">
              Desde {COMPANY.founded}, já impactamos <strong>{COMPANY.clients}</strong>. Operamos com processos auditáveis,
              parceiros logísticos confiáveis e uma jornada pensada para reduzir atritos e aumentar a sua segurança.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trust.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-neutral-200 bg-white p-4 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-neutral-900 p-1.5">{t.icon}</span>
                    <p className="text-sm font-semibold">{t.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* -------------------- MISSÃO / VISÃO / VALORES ---------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center mb-6">
          <Title text1="NOSSA" text2="IDENTIDADE" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Missão",
              desc:
                "Inspirar saúde e confiança por meio de peças funcionais e atendimento próximo, do carrinho à entrega.",
            },
            {
              title: "Visão",
              desc:
                `Ser referência nacional em ${COMPANY.segment} & Casual com inovação, acessibilidade e curadoria consistente.`,
            },
            {
              title: "Valores",
              desc: null,
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h4 className="text-lg font-semibold text-neutral-900">{card.title}</h4>
              {card.desc ? (
                <p className="mt-2 text-sm text-neutral-700">{card.desc}</p>
              ) : (
                <ul className="mt-2 text-sm text-neutral-700 list-disc pl-5 space-y-1">
                  {values.map((v, i) => (
                    <li key={i}>
                      <strong>{v.title}:</strong> {v.desc}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ------------------------- DIFERENCIAIS ----------------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center mb-6">
          <Title text1="O QUE" text2="ENTREGAMOS" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Award className="h-5 w-5" />,
              title: "Curadoria profissional",
              desc: "Seleção técnica com foco em caimento e performance.",
            },
            {
              icon: <UserCheck className="h-5 w-5" />,
              title: "Suporte humano",
              desc: "Equipe real, respostas claras e resolução ágil.",
            },
            {
              icon: <Truck className="h-5 w-5" />,
              title: "Rastreio completo",
              desc: "Acompanhe seu pedido com atualizações a cada etapa.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.05 * i)}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-neutral-900 p-1.5">
                  {card.icon}
                </span>
                <h4 className="font-semibold">{card.title}</h4>
              </div>
              <p className="mt-2 text-sm text-neutral-700">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ------------- TRANSPARÊNCIA / DADOS LEGAIS / POLÍTICAS ------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center mb-6">
          <Title text1="TRANSPARÊNCIA" text2="E CONFIANÇA" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4"
          >
            <h4 className="text-lg font-semibold text-neutral-900">Dados do Negócio</h4>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{COMPANY.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>
                <strong>CNPJ:</strong> {COMPANY.cnpj}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>Certificado SSL • Meios de pagamento verificados</span>
            </div>
            <div className="flex gap-2 pt-2">
              <a
                href="/privacidade"
                className="text-sm underline underline-offset-4 hover:opacity-80"
              >
                Privacidade
              </a>
              <span className="text-neutral-400">•</span>
              <a
                href="/entrega"
                className="text-sm underline underline-offset-4 hover:opacity-80"
              >
                Entrega
              </a>
              <span className="text-neutral-400">•</span>
              <a
                href="/trocas"
                className="text-sm underline underline-offset-4 hover:opacity-80"
              >
                Trocas/Devoluções
              </a>
            </div>
          </motion.div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {policies.map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-neutral-200 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-neutral-900 p-1.5">
                    {p.icon}
                  </span>
                  <p className="text-sm font-semibold">{p.title}</p>
                </div>
                <p className="mt-1 text-xs text-neutral-600">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --------------------------- TIMELINE (FIX) -------------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center mb-6">
          <Title text1="NOSSA" text2="JORNADA" />
        </div>

        {/* 
          Correção do “0●25”: aumentamos o padding da coluna (pl-10), 
          reposicionamos o marcador (left-0) e deslocamos o texto (ml-3),
          evitando que o ponto sobreponha o primeiro dígito do ano.
        */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-neutral-200" aria-hidden />
          <ul className="space-y-10 pl-10">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span
                  className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border border-neutral-900 bg-white"
                  aria-hidden
                />
                <div className="ml-10">
                  <h5 className="text-sm font-semibold tracking-wide">{t.year}</h5>
                  <p className="text-sm text-neutral-700">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      

      {/* --------------------------- DEPOIMENTOS ----------------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="text-center mb-6">
          <Title text1="O QUE DIZEM" text2="NOSSOS CLIENTES" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <p className="text-sm text-neutral-700">“{t.text}”</p>
              <div className="mt-3 text-xs text-neutral-500">
                {t.name} • {t.when}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ------------------------------- CTA --------------------------------- */}
      <motion.section {...fadeUp(0)}>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">Pronto para conhecer nossos produtos?</h4>
            <p className="text-sm text-neutral-300">
              Explore a coleção e fale com a gente se precisar de ajuda.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/outlet"
              className="inline-flex items-center justify-center rounded-xl border border-white bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 hover:opacity-90 active:translate-y-[1px]"
            >
              Ver Coleção
            </a>
            <a
              href="/contato"
              className="inline-flex items-center justify-center rounded-xl border border-white px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 active:translate-y-[1px]"
            >
              Falar com Suporte
            </a>
          </div>
        </div>
      </motion.section>

      {/* ---------------------------- NEWSLETTER ----------------------------- */}
      <motion.section {...fadeUp(0)}>
        <NewsLetterBox />
      </motion.section>
    </div>
  );
};

export default About;
