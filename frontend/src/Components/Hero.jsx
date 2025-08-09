import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Title from './Title';

const Hero = () => {
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
      className="relative min-h-[70vh] w-full overflow-hidden rounded-3xl border border-gray-200 bg-black group shadow-2xl"
      aria-label="Destaque de Novidades"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Vídeo de fundo */}
      <AnimatePresence mode="wait">
        {!isMobile && (
          <motion.video
            key="hero-video"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ${
              hover ? 'blur-[2px] scale-105 brightness-[0.85]' : 'brightness-90'
            }`}
            src={assets.hero_video}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Overlay para mobile */}
      {isMobile && (
        <div className="absolute inset-0 bg-black/60 z-0" />
      )}

      {/* Conteúdo central */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: hover || isMobile ? 1 : 0 }}
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
          className="text-white/90 text-base sm:text-lg md:text-xl max-w-xl mb-6 drop-shadow-md"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Explore a coleção que conecta moda e atitude.
        </motion.p>

        <motion.button
          onClick={() => navigate('/outlet')}
          whileHover={{ scale: 1.05, boxShadow: '0px 8px 20px rgba(0,0,0,0.25)' }}
          whileTap={{ scale: 0.95 }}
          className="relative cursor-pointer bg-white text-black font-medium px-7 py-3 rounded-full shadow-lg 
                     transition-all duration-300 hover:bg-gray-100 active:scale-95
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
          <span className="relative z-10">Explorar</span>
          {/* efeito de highlight animado no hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </motion.div>

      {/* Texto lateral no desktop */}
      {!hover && !isMobile && (
        <motion.div
          className="absolute bottom-6 right-4 sm:bottom-10 sm:right-10 text-right text-white max-w-sm z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
        >
          <p className="text-sm sm:text-base font-light tracking-wider uppercase mb-2 opacity-80">
            Tendência 2025
          </p>
          <Title text1="Vista o futuro" text2="com autenticidade" />
          <p className="mt-2 text-sm sm:text-base opacity-90 drop-shadow">
            Explore a coleção que conecta moda e atitude.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};

export default Hero;
