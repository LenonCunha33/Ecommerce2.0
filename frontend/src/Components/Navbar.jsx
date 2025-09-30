// src/Components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";

const HeartIcon = ({ filled = false, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-6 h-6 ${className}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19.84 4.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-.06-.06a5.5 5.5 0 0 0-7.78 7.78l.06.06L12 21l7.78-8.55.06-.06a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { favorites, isLoggedIn, search, setSearch, token, logout } = useContext(ShopContext);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setShowSearch(false);
      }
      if (e.key === "Enter" && document.activeElement === searchRef.current?.querySelector("input")) {
        if (search?.trim()) navigate(`${location.pathname}?q=${encodeURIComponent(search.trim())}`);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [search, location.pathname, navigate]);

  return (
    <nav className="flex items-center justify-between py-4 px-4 sm:px-8 lg:px-20 bg-white shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex-shrink-0">
        <img src={assets.logo} alt="logo Marima" className="w-28 sm:w-36" />
      </Link>

      <ul className="hidden mr-10 sm:flex gap-8 text-gray-700 text-sm font-medium">
        {["/", "/outlet", "/casual", "/fitness", "/sobre", "/contato"].map((path, idx) => (
          <NavLink
            key={idx}
            to={path}
            className={({ isActive }) =>
              `relative py-1 group ${isActive ? "text-gray-900 font-semibold" : "hover:text-gray-900"}`
            }
          >
            <span className="capitalize">
              {path === "/"
                ? "Início"
                : path === "/outlet"
                ? "Outlet"
                : path === "/casual"
                ? "Casual"
                : path === "/fitness"
                ? "Fitness"
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

      <div className="flex items-center gap-5 sm:gap-6 relative">
        <button
          onClick={() => navigate(isLoggedIn ? "/dashboard?tab=favoritos" : "/login")}
          className="relative text-gray-800 hover:text-gray-900"
          aria-label="Favoritos"
          title="Favoritos"
        >
          <HeartIcon className="block" />
          {favorites?.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] leading-[16px] text-[10px] text-center bg-red-600 text-white rounded-full px-1">
              {favorites.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2" ref={searchRef}>
          <motion.img
            src={assets.search_icon}
            alt="Buscar"
            className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setShowSearch((v) => !v);
              setTimeout(() => {
                const input = searchRef.current?.querySelector("input");
                input && input.focus();
              }, 0);
            }}
          />
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Pesquisar em todo o site..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-sm bg-transparent border-b border-gray-300 outline-none px-2 py-1 w-[220px] text-gray-700 placeholder:text-gray-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <motion.img
            src={assets.profile_icon}
            alt="Perfil"
            className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              if (!token) return navigate("/login");
              setProfileOpen((v) => !v);
            }}
            aria-expanded={profileOpen}
            aria-controls="profile-menu"
          />

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

          <AnimatePresence>
            {token && profileOpen && (
              <motion.div
                id="profile-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 bg-white shadow-lg rounded-md text-gray-600 py-2 w-44 space-y-1 z-50"
              >
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full text-left px-4 py-2 hover:text-gray-900 text-sm"
                >
                  Meu Perfil
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

        <motion.img
          src={assets.menu_icon}
          alt="Menu"
          className="w-6 h-6 cursor-pointer sm:hidden"
          whileTap={{ scale: 0.92 }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
        />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white z-50 flex flex-col"
          >
            <div className="flex justify-end p-4">
              <motion.img
                src={assets.dropdown_icon}
                alt="Fechar"
                className="w-6 h-6 cursor-pointer rotate-180"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(false)}
              />
            </div>

            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
              }}
              className="flex flex-col items-center justify-center flex-1 gap-8 text-lg font-medium"
            >
              {["/", "/outlet", "/casual", "/fitness", "/sobre", "/contato"].map((path, idx) => (
                <motion.div key={idx} variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                  <NavLink
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `capitalize transition-all duration-300 ${
                        isActive
                          ? "text-gray-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                          : "text-gray-600 hover:text-gray-900"
                      }`
                    }
                  >
                    {path === "/"
                      ? "Início"
                      : path === "/outlet"
                      ? "Outlet"
                      : path === "/casual"
                      ? "Casual"
                      : path === "/fitness"
                      ? "Fitness"
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
