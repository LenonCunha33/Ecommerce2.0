// imports
import { useContext, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import CartTotal from "../Components/CartTotal";
import Title from "../Components/Title";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const PlaceOrder = () => {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    discount,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      // Monta lista de itens do pedido
      const orderItems = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === productId)
            );
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[productId][size];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee - discount,
        discount,
      };

      console.log("Enviando pedido para Stripe...");
      const res = await axios.post(
        `${backendUrl}/api/order/stripe`,
        orderData,
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        window.location.replace(res.data.session_url);
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast.error(error.response?.data?.message || "Erro ao finalizar pedido");
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row gap-10 px-4 md:px-10 pt-8 pb-16 border-t max-w-screen-xl mx-auto"
    >
      {/* ----------- Lado Esquerdo - Informações ----------- */}
      <div className="flex-1 space-y-5">
        <div className="text-2xl font-semibold">
          <Title text1={"INFORMAÇÕES"} text2={"DE ENTREGA"} />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            name="firstName"
            onChange={onChangeHandler}
            value={formData.firstName}
            type="text"
            required
            placeholder="Nome"
            className="input"
          />
          <input
            name="lastName"
            onChange={onChangeHandler}
            value={formData.lastName}
            type="text"
            required
            placeholder="Sobrenome"
            className="input"
          />
        </div>

        <input
          name="email"
          onChange={onChangeHandler}
          value={formData.email}
          type="email"
          required
          placeholder="E-mail"
          className="input"
        />
        <input
          name="street"
          onChange={onChangeHandler}
          value={formData.street}
          type="text"
          required
          placeholder="Rua"
          className="input"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <input
            name="city"
            onChange={onChangeHandler}
            value={formData.city}
            type="text"
            required
            placeholder="Cidade"
            className="input"
          />
          <input
            name="state"
            onChange={onChangeHandler}
            value={formData.state}
            type="text"
            required
            placeholder="Estado"
            className="input"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            name="zipcode"
            onChange={onChangeHandler}
            value={formData.zipcode}
            type="text"
            required
            placeholder="CEP"
            className="input"
          />
          <input
            name="country"
            onChange={onChangeHandler}
            value={formData.country}
            type="text"
            required
            placeholder="País"
            className="input"
          />
        </div>

        <input
          name="phone"
          onChange={onChangeHandler}
          value={formData.phone}
          type="tel"
          required
          placeholder="Telefone"
          className="input"
        />
      </div>

      {/* ----------- Lado Direito ----------- */}
      <div className="flex-1">
        <div className="mb-6">
          <CartTotal />
        </div>

        <div className="text-end pt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="bg-black hover:bg-gray-800 text-white py-3 px-12 rounded-lg text-base font-medium transition"
          >
            FINALIZAR PEDIDO
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
};

export default PlaceOrder;
