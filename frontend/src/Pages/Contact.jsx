import { assets } from "../assets/assets";
import NewsLetterBox from "../Components/NewsLetterBox";
import Title from "../Components/Title";
import { motion } from "framer-motion";

const Contact = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-5 sm:px-10 lg:px-20 pt-12 pb-28 border-t max-w-screen-xl mx-auto"
    >
      {/* Título */}
      <div className="text-2xl mb-10">
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
            7298 King Lodge <br />
            North Elton, Illinois 78154
          </p>

          <p>
            Tel: <span className="text-gray-500">+1 800 123 1234</span>
          </p>
          <p>
            Email:{" "}
            <span className="text-gray-500">admin@forever.com</span>
          </p>

          <div className="mt-4">
            <h4 className="font-medium text-gray-800">Carreiras na Forever</h4>
            <p className="text-gray-500 mt-1">
              Saiba mais sobre nossas equipes e vagas em aberto.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={scrollToTop}
            className="mt-4 border border-black px-6 py-3 text-sm text-black hover:bg-black hover:text-white transition-all duration-300 rounded-md"
          >
            Explorar Vagas
          </motion.button>
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

      {/* Newsletter */}
      <div className="mt-16">
        <NewsLetterBox />
      </div>
    </motion.div>
  );
};

export default Contact;
