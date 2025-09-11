// src/Components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

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
    setProfileOpen(false);
    navigate('/login');
  };

  // Fecha menus ao trocar de rota
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Fecha dropdown do perfil ao clicar fora ou ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    if (profileOpen) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick, { passive: true });
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  // Busca habilitada em /outlet e /fitness
  const isSearchPage = ['/outlet', '/fitness'].includes(location.pathname);

  return (
    <nav className="flex items-center justify-between py-5 px-4 sm:px-8 lg:px-20 bg-white shadow-sm sticky top-0 z-50">
      {/* LOGO */}
      <Link to="/" className="flex-shrink-0">
        <img src={assets.logo} alt="logo Marima" className="w-28 sm:w-36" />
      </Link>

      {/* LINKS DESKTOP */}
      <ul className="hidden mr-10 sm:flex gap-8 text-gray-700 text-sm font-medium">
        {['/', '/outlet', '/fitness', '/sobre', '/contato'].map((path, idx) => (
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
              {path === '/'
                ? 'Início'
                : path === '/outlet'
                ? 'Outlet'
                : path === '/fitness'
                ? 'Fitness'
                : path.slice(1)}
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
        {/* ÍCONE DE BUSCA */}
        <div className="flex items-center gap-2">
          {isSearchPage ? (
            <>
              <motion.img
                src={assets.search_icon}
                alt="Buscar"
                className="w-5 cursor-pointer"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch((v) => !v)}
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
        <div className="relative" ref={profileRef}>
          <motion.img
            src={assets.profile_icon}
            alt="Perfil"
            className="w-5 cursor-pointer"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (!token) return navigate('/login');
              setProfileOpen((v) => !v);
            }}
            aria-expanded={profileOpen}
            aria-controls="profile-menu"
          />

          {/* Overlay para capturar toque fora (só mobile) */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="fixed inset-0 sm:hidden z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setProfileOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Dropdown do perfil (abre por clique no mobile e desktop) */}
          <AnimatePresence>
            {token && profileOpen && (
              <motion.div
                id="profile-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 bg-white shadow-lg rounded-md text-gray-600 py-2 w-40 space-y-1 z-50"
              >
                <button
                  onClick={() => navigate('/perfil')}
                  className="w-full text-left px-4 py-2 hover:text-gray-900 text-sm"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={() => navigate('/pedidos')}
                  className="w-full text-left px-4 py-2 hover:text-gray-900 text-sm"
                >
                  Pedidos
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:text-gray-900 text-sm"
                >
                  Sair
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
        />
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white z-50 flex flex-col"
          >
            {/* FECHAR */}
            <div className="flex justify-end p-4">
              <motion.img
                src={assets.dropdown_icon}
                alt="Fechar"
                className="w-6 h-6 cursor-pointer rotate-180"
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(false)}
              />
            </div>

            {/* LINKS ANIMADOS */}
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.15 },
                },
              }}
              className="flex flex-col items-center justify-center flex-1 gap-8 text-lg font-medium"
            >
              {['/', '/outlet', '/fitness', '/sobre', '/contato'].map((path, idx) => (
                <motion.div
                  key={idx}
                  variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                >
                  <NavLink
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `capitalize transition-all duration-300 ${
                        isActive
                          ? 'text-gray-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]'
                          : 'text-gray-600 hover:text-gray-900'
                      }`
                    }
                  >
                    {path === '/'
                      ? 'Início'
                      : path === '/outlet'
                      ? 'Outlet'
                      : path === '/fitness'
                      ? 'Fitness'
                      : path.slice(1)}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
