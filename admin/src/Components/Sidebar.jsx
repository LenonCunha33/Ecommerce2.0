import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const navItems = [
  {
    to: '/add',
    icon: assets.add_icon,
    label: 'Adicionar Itens',
  },
  {
    to: '/list',
    icon: assets.order_icon,
    label: 'Listar Itens',
  },
  {
    to: '/orders',
    icon: assets.order_icon,
    label: 'Pedidos',
  },
];

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r border-gray-200 bg-white fixed md:relative z-50">
      <div className="flex flex-col gap-4 pt-8 px-4 md:pl-[20%] text-[15px]">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 
              ${isActive ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`
            }
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md group-hover:bg-gray-300 transition-all"
            >
              <img src={item.icon} alt={`Ícone de ${item.label}`} className="w-5 h-5" />
            </motion.div>
            <p className="hidden md:block font-medium truncate">{item.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
