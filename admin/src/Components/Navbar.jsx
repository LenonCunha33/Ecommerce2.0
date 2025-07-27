import React from 'react';
import { assets } from '../assets/assets.js';
import { motion } from 'framer-motion';

const Navbar = ({ setToken }) => {
  return (
    <motion.nav
      className="w-full bg-white shadow-md px-4 md:px-8 py-3 flex items-center justify-between z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.03 }}
      >
        <img
          src={assets.logo}
          alt="Logo da empresa"
          className="w-20 sm:w-24 object-contain"
        />
      </motion.div>

      {/* Botão de logout */}
      <motion.button
        onClick={() => setToken('')}
        className="bg-gray-800 text-white text-sm sm:text-base px-4 py-2 rounded-full hover:bg-gray-700 transition duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sair
      </motion.button>
    </motion.nav>
  );
};

export default Navbar;
