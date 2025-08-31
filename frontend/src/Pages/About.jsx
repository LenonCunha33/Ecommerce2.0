"use client";
import { assets } from "../assets/assets";
import NewsLetterBox from "../Components/NewsLetterBox";
import Title from "../Components/Title";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 space-y-24 text-gray-700">
      {/* Título principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <Title text1="SOBRE" text2="NÓS" />
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Conheça a <span className="font-semibold text-gray-900">Marima</span>, 
          um ecommerce especializado em <strong>moda fitness</strong> que une 
          estilo, tecnologia e inovação para transformar sua experiência de compra online.
        </p>
      </motion.div>

      {/* Sessão principal - imagem + descrição */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          src={assets.about_img}
          alt="Equipe da Marima - moda fitness"
          className="w-full md:max-w-md rounded-2xl shadow-lg object-cover"
        />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col gap-4 md:w-3/5 text-base sm:text-lg leading-relaxed"
        >
          <p>
            A <span className="font-semibold text-gray-900">Marima</span> nasceu 
            no ambiente digital com o propósito de simplificar a forma como você 
            compra roupas fitness online. Nossa visão sempre foi clara: unir{" "}
            <strong>praticidade</strong>, <strong>rapidez na entrega</strong> e 
            <strong>segurança</strong> em cada pedido.
          </p>
          <p>
            Desenvolvemos coleções que unem <strong>tecnologia têxtil</strong>, 
            caimento perfeito e design moderno, criando peças que valorizam a 
            autoestima e acompanham sua rotina — seja no treino ou no dia a dia.
          </p>
          <p>
            Mais do que um ecommerce, somos uma marca que acredita no poder da 
            moda fitness como um <strong>estilo de vida saudável e inspirador</strong>.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nossa Missão
            </h3>
            <p>
              Inspirar saúde e confiança através da moda fitness, oferecendo 
              produtos de alta qualidade e uma experiência de compra digital 
              moderna, acolhedora e eficiente.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nossa Visão
            </h3>
            <p>
              Ser referência nacional em <strong>ecommerce fitness</strong>, 
              entregando inovação, acessibilidade e autenticidade em cada coleção.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Motivos */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Title text1="POR QUE" text2="ESCOLHER A GENTE" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Qualidade Garantida",
            text: "Peças com tecidos tecnológicos, resistentes e projetados para alta performance.",
          },
          {
            title: "Compra Segura e Fácil",
            text: "Navegação intuitiva, checkout otimizado e diversas opções de pagamento.",
          },
          {
            title: "Atendimento Humanizado",
            text: "Nossa equipe está disponível 24/7 para ajudar e oferecer suporte rápido.",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-xl transition-all duration-300"
          >
            <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
            <p className="text-gray-600 text-sm sm:text-base">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        <Title text1="PERGUNTAS" text2="FREQUENTES" />

        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            {
              q: "Qual o prazo de entrega?",
              a: "Trabalhamos com envios ágeis e a maioria dos pedidos chega entre 2 e 5 dias úteis.",
            },
            {
              q: "Posso trocar ou devolver meu pedido?",
              a: "Sim! Garantimos até 7 dias para devoluções sem custo adicional.",
            },
            {
              q: "Os produtos possuem garantia?",
              a: "Sim, todos os produtos têm garantia contra defeitos de fabricação.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.2 }}
              className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <h4 className="font-semibold text-gray-800">{item.q}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <NewsLetterBox />
      </motion.div>
    </div>
  );
};

export default About;
