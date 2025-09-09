import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: i * 0.2 },
  }),
};

const Banner = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // mobile e tablet
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <section
      className="w-full flex flex-col overflow-hidden bg-[#FAFAFA]"
      aria-label="Seção Banner Destaque"
    >
      <div className="relative w-full h-[600px] flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        
        {/* Imagem Desktop */}
        {!isMobile && (
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 hidden md:block"
          >
            <img
              src={assets.banner}
              alt="Banner Desktop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </motion.div>
        )}

        {/* Imagem Mobile */}
        {isMobile && (
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 block md:hidden"
          >
            <img
              src={assets.Mobile2}
              alt="Banner Mobile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </motion.div>
        )}

        {/* Texto centralizado */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-20 flex flex-col items-center justify-center text-center max-w-2xl px-4"
        >
          {/* Texto de fundo */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05, opacity: 0.5 }}
            className="absolute text-[60px] md:text-[120px] lg:text-[220px] font-extrabold text-white/40 leading-none select-none"
          >
            Moda Fitness
          </motion.h1>

          {/* Títulos */}
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg"
          >
            Performance & Equilíbrio
          </motion.h2>

          {/* Texto descritivo */}
          <motion.p
            custom={1}
            variants={fadeUp}
            className="mt-4 text-sm md:text-lg text-white/90 drop-shadow-lg"
          >
            Um equilíbrio perfeito entre conforto, qualidade e versatilidade,
            acompanhando você do treino às atividades do dia a dia com sofisticação.
          </motion.p>

          {/* Botão CTA */}
          <motion.button
            onClick={() => navigate("/outlet")}
            custom={2}
            variants={fadeUp}
            whileHover={{ scale: 1.1, backgroundColor: "#f3f3f3" }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer z-1 mt-6 bg-white text-black font-medium px-6 py-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
          >
            Explorar
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Banner;
