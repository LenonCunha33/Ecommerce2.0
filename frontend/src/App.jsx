import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
              <Route path="/" element={<Home />} />
              <Route path="/outlet" element={<Collection />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/product/:productId" element={<Product />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/fazer-pedido" element={<PlaceOrder />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/entrega" element={<Entrega />} />
              <Route path="/privacidade" element={<Privacidade />} />
            </Routes>

            <Footer />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
