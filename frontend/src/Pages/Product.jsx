import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../Components/RelatedProducts";
import { motion } from "framer-motion";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productsData, setProductsData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    const foundProduct = products.find((p) => p._id === productId);
    if (foundProduct) {
      setProductsData(foundProduct);
      setImage(foundProduct.image[0]);
    }
  }, [productId, products]);

  return productsData ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-12 px-6 md:px-12 max-w-screen-xl mx-auto text-lg"
    >
      {/* Produto */}
      <div className="flex flex-col lg:flex-row gap-14">
        {/* Imagens */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-1/2">
          {/* Miniaturas */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto">
            {productsData.image.map((item, index) => (
              <motion.img
                whileHover={{ scale: 1.05 }}
                key={index}
                src={item}
                alt="produto"
                onClick={() => setImage(item)}
                className={`w-24 h-24 object-cover cursor-pointer border rounded-md ${
                  image === item ? "border-orange-500" : "border-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Imagem Principal */}
          <motion.img
            key={image}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={image}
            alt="produto"
            className="w-full max-h-[600px] object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Detalhes */}
        <div className="w-full lg:w-1/2 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 leading-snug">
            {productsData.name}
          </h1>

          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <img key={i} src={assets.star_icon} alt="" className="w-5" />
            ))}
            <img src={assets.star_dull_icon} alt="" className="w-5" />
            <p className="text-base text-gray-500 pl-2">(122)</p>
          </div>

          <p className="text-4xl font-bold text-gray-900">
            {currency}
            {productsData.price}
          </p>

          <p className="text-gray-600 text-[1.05rem] leading-relaxed">
            {productsData.description}
          </p>

          {/* Tamanhos */}
          <div className="space-y-3">
            <p className="font-medium text-lg">Selecionar Tamanho</p>
            <div className="flex flex-wrap gap-3">
              {productsData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSize(item)}
                  className={`w-11 h-11 flex items-center justify-center border rounded-md text-base font-medium ${
                    item === size
                      ? "border-orange-500 bg-orange-100"
                      : "border-gray-300 bg-white"
                  } transition-all`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => addToCart(productsData._id, size)}
            className="w-full md:w-auto bg-black hover:bg-gray-800 text-white py-4 px-8 rounded-md shadow transition-colors text-lg"
          >
            ADICIONAR AO CARRINHO
          </motion.button>

          <ul className="text-base text-gray-600 mt-5 space-y-1">
            <li>✓ Produto 100% original</li>
            <li>✓ Entrega gratuita para pedidos acima de R$ 49</li>
            <li>✓ Política de troca e devolução em até 7 dias</li>
          </ul>
        </div>
      </div>

      {/* Tabs Descrição / Avaliação */}
      <div className="mt-16">
        <div className="flex border-b text-lg font-medium">
          <button className="px-6 py-4 border-b-2 border-black">
            Descrição
          </button>
          <button className="px-6 py-4 text-gray-500 hover:text-black">
            Avaliações (122)
          </button>
        </div>

        <div className="px-6 py-6 text-gray-600 space-y-5 text-base leading-relaxed border rounded-b-lg">
          <p>
            Um site de e-commerce é uma plataforma online que facilita a compra
            e venda de produtos ou serviços pela internet. Ele funciona como um
            mercado virtual onde empresas e indivíduos podem exibir seus
            produtos, interagir com clientes e realizar transações sem a
            necessidade de uma presença física.
          </p>
          <p>
            Sites de e-commerce normalmente exibem produtos ou serviços com
            descrições detalhadas, imagens, preços e variações disponíveis (por
            exemplo, tamanhos, cores).
          </p>
        </div>
      </div>

      {/* Produtos Relacionados */}
      <div className="mt-20">
        <RelatedProducts
          category={productsData.category}
          subCategory={productsData.subCategory}
        />
      </div>
    </motion.div>
  ) : (
    <div className="h-96 flex items-center justify-center animate-pulse text-gray-400 text-xl">
      Carregando produto...
    </div>
  );
};

export default Product;
