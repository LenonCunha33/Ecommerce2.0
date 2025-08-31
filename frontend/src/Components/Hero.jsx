import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: i * 0.2 },
  }),
};

function Hero() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobileOrTablet(width < 1024); // até 1023px (tablet e mobile)
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <section
      className="w-full flex flex-col overflow-hidden bg-[#FAFAFA]"
      aria-label="Seção de Promoção Estilos Diários"
    >
      {/* Hero Banner */}
      <div className="relative w-full h-[600px] flex items-center justify-center">
        
        {/* Imagem Desktop */}
        {!isMobileOrTablet && (
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 hidden lg:block"
          >
            <img
              src={assets.hero_video}
              alt="Estilos Diários Desktop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </motion.div>
        )}

        {/* Imagem Mobile/Tablet */}
        {isMobileOrTablet && (
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 block lg:hidden"
          >
            <img
              src={assets.Mobile1}
              alt="Estilos Diários Mobile/Tablet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </motion.div>
        )}

        {/* Texto Central */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={`relative z-10 flex flex-col ${
            isMobileOrTablet
              ? "items-center justify-center text-center px-4"
              : "items-center justify-center text-center"
          }`}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-[70px] md:text-[150px] lg:text-[250px] font-extrabold text-white/40 leading-none select-none"
          >
          Fitness
          </motion.h1>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-light md:text-5xl font-light lg:text-6xl font-bold text-white -mt-12 md:-mt-24 drop-shadow-lg"
          >
            Perfomance &
          </motion.h2>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-light md:text-5xl font-light lg:text-6xl font-extrabold text-white drop-shadow-lg"
          >
            Conforto
          </motion.h2>

          <motion.p
            custom={1}
            variants={fadeUp}
            className="text-white/90 mt-3 text-sm md:text-lg max-w-lg px-2 md:px-0"
          >
            Um equilíbrio perfeito entre conforto, qualidade e versatilidade,
            acompanhando você do treino às atividades do dia a dia com sofisticação.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
