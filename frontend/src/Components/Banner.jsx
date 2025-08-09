import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Title from './Title';

const Banner = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.section
      className="relative min-h-[70vh] w-full overflow-hidden rounded-3xl border border-gray-300 bg-black group shadow-xl"
      aria-label="Destaque de Novidades"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Imagem de fundo */}
      <motion.img
        key="hero-image"
        className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ${
          hover ? 'blur-sm scale-105' : ''
        }`}
        src={assets.banner}
        alt="Banner principal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Texto central no hover */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Title text1="Vista o futuro" text2="com autenticidade" />
        </motion.div>

        <motion.p
          className="text-white text-base sm:text-lg md:text-xl max-w-xl mb-6 drop-shadow-md"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Explore o Melhor da Coleção Moda e Atitude.
        </motion.p>

        <motion.button
          onClick={() => navigate('/outlet')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black font-medium px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-100 cursor-pointer"
        >
          Explorar
        </motion.button>
      </motion.div>

      {/* Texto no canto inferior direito (desktop) */}
      {!hover && (
        <motion.div
          className="absolute bottom-6 right-4 sm:bottom-10 sm:right-10 text-right text-white max-w-sm z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
        >
          <p className="text-sm sm:text-base font-light tracking-wider uppercase mb-2 opacity-80">
            Tendência 2025
          </p>
          <Title text1="Vista o Futuro" text2="E Não Erre" />
          <p className="mt-2 text-sm sm:text-base opacity-90 drop-shadow">
            Navegue Pelos Queridinhos de Todos
          </p>
        </motion.div>
      )}

      {/* Overlay para escurecer imagem em mobile */}
      {isMobile && (
        <div className="absolute inset-0 bg-black/60 z-0" />
      )}
    </motion.section>
  );
};

export default Banner;
