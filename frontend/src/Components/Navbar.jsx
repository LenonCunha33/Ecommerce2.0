import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation(); // Para verificar a rota atual

  const {
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    search,
    setSearch,
  } = useContext(ShopContext);

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
    navigate('/login');
  };

  const isOutletPage = location.pathname === '/outlet';

  return (
    <nav className="flex items-center justify-between py-5 px-4 sm:px-8 lg:px-20 bg-white shadow-sm sticky top-0 z-50">
      {/* LOGO */}
      <Link to="/" className="flex-shrink-0">
        <img src={assets.logo} alt="logo Marima" className="w-28 sm:w-36" />
      </Link>

      {/* LINKS */}
      <ul className="hidden sm:flex gap-8 text-gray-700 text-sm font-medium">
        {['/', '/outlet', '/sobre', '/contato'].map((path, idx) => (
          <NavLink
            key={idx}
            to={path}
            className={({ isActive }) =>
              `relative py-1 group ${
                isActive ? 'text-gray-900 font-semibold' : 'hover:text-gray-900'
              }`
            }
          >
            <span className="capitalize">
              {path === '/' ? 'Início' : path === '/outlet' ? 'Outlet' : path.slice(1)}
            </span>
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-black scale-x-0 origin-left"
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </NavLink>
        ))}
      </ul>

      {/* ICONES AÇÃO */}
      <div className="flex items-center gap-6 relative">
        {/* ÍCONE DE BUSCA + BARRA */}
        <div className="flex items-center gap-2">
          {isOutletPage ? (
            <>
              <motion.img
                src={assets.search_icon}
                alt="Buscar"
                className="w-5 cursor-pointer"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(!showSearch)}
              />
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '160px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="text-sm bg-transparent border-b border-gray-300 outline-none px-2 py-1 w-full text-gray-700 placeholder:text-gray-400"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <img
              src={assets.search_icon}
              alt="Buscar"
              className="w-5 cursor-pointer opacity-60"
            />
          )}
        </div>

        {/* ÍCONE PERFIL */}
        <div className="relative group">
          <motion.img
            src={assets.profile_icon}
            alt="Perfil"
            className="w-5 cursor-pointer"
            whileTap={{ scale: 0.9 }}
            onClick={() => (token ? null : navigate('/login'))}
          />
          {token && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 bg-white shadow-lg rounded-md text-gray-600 py-2 w-36 space-y-1 hidden group-hover:block"
            >
              {['Meu Perfil', 'Pedidos', 'Sair'].map((label, i) => (
                <p
                  key={i}
                  onClick={i === 2 ? logout : () => navigate(i === 1 ? '/pedidos' : '/perfil')}
                  className="px-4 py-2 hover:text-gray-900 cursor-pointer text-sm"
                >
                  {label}
                </p>
              ))}
            </motion.div>
          )}
        </div>

        {/* ÍCONE CARRINHO */}
        <Link to="/carrinho" className="relative">
          <motion.img
            src={assets.cart_icon}
            alt="Carrinho"
            className="w-5 cursor-pointer"
            whileTap={{ scale: 0.9 }}
          />
          <span className="absolute -right-1 -bottom-1 w-4 h-4 bg-black text-white text-[8px] leading-[1] rounded-full flex items-center justify-center">
            {getCartCount()}
          </span>
        </Link>

        {/* ÍCONE MENU MOBILE */}
        <motion.img
          src={assets.menu_icon}
          alt="Menu"
          className="w-5 cursor-pointer sm:hidden"
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
        />
      </div>

      {/* MENU MOBILE LATERAL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-lg z-50"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-lg font-semibold">Menu</p>
              <motion.img
                src={assets.dropdown_icon}
                alt="Fechar"
                className="w-5 h-5 cursor-pointer rotate-180"
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(false)}
              />
            </div>
            <nav className="flex flex-col text-gray-600 text-base">
              {['/', '/outlet', '/sobre', '/contato'].map((path, idx) => (
                <NavLink
                  key={idx}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="py-4 px-6 border-b hover:bg-gray-100"
                >
                  {path === '/' ? 'Início' : path === '/outlet' ? 'Outlet' : path.slice(1)}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
