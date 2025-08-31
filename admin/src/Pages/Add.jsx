"use client";
import { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestSeller ? "true" : "false");
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("✅ Produto adicionado com sucesso!");
        setName("");
        setDescription("");
        setPrice("");
        setSizes([]);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setBestSeller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao adicionar produto");
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full mt-10 max-w-3xl mx-auto px-4 py-8 sm:px-6 md:px-10 gap-6 bg-white rounded-2xl shadow-xl border border-gray-100"
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
      role="form"
      aria-label="Formulário de adição de novo produto"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">
        Adicionar Novo Produto
      </h2>

      {/* Upload de Imagens */}
      <section>
        <p className="mb-3 font-medium text-gray-700">
          Upload de imagens do produto
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[image1, image2, image3, image4].map((img, index) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <motion.label
                htmlFor={`image${index + 1}`}
                key={index}
                className="w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt={
                    img
                      ? `Pré-visualização da imagem ${index + 1}`
                      : `Upload da imagem ${index + 1}`
                  }
                  className="w-full h-full object-cover"
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                  aria-label={`Selecionar imagem ${index + 1} do produto`}
                />
              </motion.label>
            );
          })}
        </div>
      </section>

      {/* Nome do Produto */}
      <div>
        <label
          htmlFor="productName"
          className="block mb-2 font-medium text-gray-700"
        >
          Nome do Produto
        </label>
        <input
          id="productName"
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          placeholder="Ex: Camiseta Premium Algodão"
          required
          aria-required="true"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all"
        />
      </div>

      {/* Descrição */}
      <div>
        <label
          htmlFor="productDescription"
          className="block mb-2 font-medium text-gray-700"
        >
          Descrição Detalhada
        </label>
        <textarea
          id="productDescription"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder="Ex: Camiseta confortável, feita em algodão sustentável..."
          required
          aria-required="true"
          className="w-full px-4 py-2 h-28 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 resize-none transition-all"
        />
      </div>

      {/* Categoria, Subcategoria e Preço */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Categoria
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all"
          >
            <option value="Women">Moda Feminina</option>
            <option value="Men">Moda Masculina</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Subcategoria
          </label>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all"
          >
            <option value="Topwear">Parte Superior</option>
            <option value="Bottomwear">Parte Inferior</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Preço</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            placeholder="Ex: 199.90"
            required
            aria-required="true"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all"
          />
        </div>
      </div>

      {/* Tamanhos */}
      <div>
        <p className="mb-2 font-medium text-gray-700">Tamanhos Disponíveis</p>
        <div className="flex flex-wrap gap-3">
          {["P", "M", "G"].map((sizeOption) => (
            <motion.button
              key={sizeOption}
              type="button"
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(sizeOption)
                    ? prev.filter((s) => s !== sizeOption)
                    : [...prev, sizeOption]
                )
              }
              className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                sizes.includes(sizeOption)
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {sizeOption}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Best Seller */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestSeller}
          onChange={() => setBestSeller((prev) => !prev)}
          className="accent-gray-900 w-5 h-5 cursor-pointer"
        />
        <label htmlFor="bestseller" className="text-gray-700 cursor-pointer">
          Destacar como Produto Mais Vendido
        </label>
      </div>

      {/* Botão de Envio */}
      <motion.button
        type="submit"
        className="mt-6 bg-gray-900 text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Adicionar Produto
      </motion.button>
    </motion.form>
  );
};

export default Add;
