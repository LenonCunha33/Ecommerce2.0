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
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
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

        {/* Texto Central - Moda Fitness */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05, opacity: 0.5 }}
          className="absolute z-10 text-[60px] md:text-[120px] lg:text-[220px] font-extrabold text-white/40 leading-none select-none text-center"
        >
          Moda Fitness
        </motion.h1>

        {/* Título Performance + Conforto */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={`absolute z-20 ${
            isMobile || isTablet
              ? "top-1/4 left-1/2 -translate-x-1/2 text-center"
              : "top-10 left-155 -translate-x-1/2 text-center"
          }`}
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-2xl font-light md:text-4xl font-light lg:text-5xl  text-white drop-shadow-lg"
          >
            Performance &
          </motion.h2>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="text-2xl font-light md:text-4xl font-light lg:text-5xl  text-white drop-shadow-lg"
          >
            Equilíbrio
          </motion.h2>
        </motion.div>

        {/* Texto descritivo */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={`absolute text-sm md:text-lg max-w-xs text-white/90 drop-shadow-lg z-20 ${
            isMobile || isTablet
              ? "bottom-24 left-1/2 -translate-x-1/2 text-center"
              : "bottom-12 right-112 text-right"
          }`}
        >
          Um equilíbrio perfeito entre conforto, qualidade e versatilidade,
          acompanhando você do treino às atividades do dia a dia com sofisticação.
        </motion.p>

        {/* Botão CTA */}
        <motion.button
          onClick={() => navigate("/outlet")}
          whileHover={{ scale: 1.1, backgroundColor: "#f3f3f3" }}
          whileTap={{ scale: 0.95 }}
          className={`absolute bg-white text-black font-medium px-6 py-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer z-20 ${
            isMobile || isTablet
              ? "bottom-10 left-1/2 -translate-x-1/2"
              : "bottom-10 right-10"
          }`}
        >
          Explorar
        </motion.button>
      </div>
    </section>
  );
};

export default Banner;
