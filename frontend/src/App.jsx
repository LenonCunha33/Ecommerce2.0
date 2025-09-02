import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import Collection from './Pages/Collection';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import Login from './Pages/Login';
import PlaceOrder from './Pages/PlaceOrder';
import Orders from './Pages/Orders';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Entrega from './Pages/Entrega';
import Privacidade from './Pages/Privacidade';
import GoogleLoader from './Components/GoogleLoader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './Pages/Verify';
import ResetPassword from './Pages/ResetPassword';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './Pages/Dashboard';

// 🔒 Protected Route
function ProtectedRoute({ children }) {
  // Exemplo: verifica se existe token salvo
  const isAuthenticated = !!localStorage.getItem('token');

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [showGoogleLoader, setShowGoogleLoader] = useState(false);
  const location = useLocation();

  // GoogleLoader a cada troca de rota
  useEffect(() => {
    setShowGoogleLoader(true);
    const timer = setTimeout(() => {
      setShowGoogleLoader(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showGoogleLoader ? (
          <motion.div
            key="google-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GoogleLoader />
          </motion.div>
        ) : (
          <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
            <ToastContainer />
            <Navbar />

            <Routes>
              {/* ✅ Rota livre */}
              <Route path="/" element={<Home />} />

              {/* 🔒 Todas abaixo são protegidas */}
              <Route
                path="/outlet"
                element={
                  <ProtectedRoute>
                    <Collection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sobre"
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contato"
                element={
                  <ProtectedRoute>
                    <Contact />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:productId"
                element={
                  <ProtectedRoute>
                    <Product />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/carrinho"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/fazer-pedido"
                element={
                  <ProtectedRoute>
                    <PlaceOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pedidos"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify"
                element={
                  <ProtectedRoute>
                    <Verify />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entrega"
                element={
                  <ProtectedRoute>
                    <Entrega />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacidade"
                element={
                  <ProtectedRoute>
                    <Privacidade />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <Footer />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
