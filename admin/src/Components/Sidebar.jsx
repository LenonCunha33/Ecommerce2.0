import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-gray-300'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
        <NavLink
          to='/add'
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-lg'
        >
          <img src={assets.add_icon} alt='Ícone de adicionar' className='w-5 h-5' />
          <p className='hidden md:block'>Adicionar Itens</p>
        </NavLink>
        <NavLink
          to='/list'
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-lg'
        >
          <img src={assets.order_icon} alt='Ícone de lista' className='w-5 h-5' />
          <p className='hidden md:block'>Listar Itens</p>
        </NavLink>
        <NavLink
          to='/orders'
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-lg'
        >
          <img src={assets.order_icon} alt='Ícone de pedidos' className='w-5 h-5' />
          <p className='hidden md:block'>Pedidos</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
