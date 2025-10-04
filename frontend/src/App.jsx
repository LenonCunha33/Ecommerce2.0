import { useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';

import Home from './Pages/Home';
import Collection from './Pages/Collection';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Product from './Pages/Product';
import Login from './Pages/Login';
import ResetPassword from './Pages/ResetPassword';
import Entrega from './Pages/Entrega';
import Privacidade from './Pages/Privacidade';
import Dashboard from './Pages/Dashboard';
import Fitness from './Pages/Fitness';
import PaymentCard from './Pages/PaymentCard';
import PaymentBoleto from './Pages/PaymentBoleto';

import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import GoogleLoader from './Components/GoogleLoader';
import CookieBanner from './Components/CookieBanner';
import ChatWidget from './Components/Chatbot/ChatWidget';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

import { ShopContext } from './Context/ShopContext';
import Casual from './Pages/Casual';

// 🔒 Protected Route usando o contexto (evita divergência com localStorage)
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(ShopContext);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  const [showGoogleLoader, setShowGoogleLoader] = useState(false);
  const location = useLocation();

  // Loader breve a cada troca de rota
  useEffect(() => {
    setShowGoogleLoader(true);
    const timer = setTimeout(() => setShowGoogleLoader(false), 500);
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
          <div className="px-4 sm:px-[5vw] md:px:[7vw] lg:px-[9vw]">
            <ToastContainer />
            <Navbar />

            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/outlet" element={<Collection />} />
              <Route path="/casual" element={<Casual />} />
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/entrega" element={<Entrega />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Produto deve ser público (não force login p/ ver) */}
              <Route path="/product/:productId" element={<Product />} />

              {/* Pós-pagamento protegidos */}
              <Route
                path="/pos-pagamento/cartao"
                element={
                  <ProtectedRoute>
                    <PaymentCard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos-pagamento/boleto"
                element={
                  <ProtectedRoute>
                    <PaymentBoleto />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard protegido */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Compat: /perfil -> /dashboard */}
              <Route path="/perfil" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ChatWidget />
            <CookieBanner />
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
