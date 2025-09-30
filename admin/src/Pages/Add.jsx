"use client";
import { useState, useMemo } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const isValidUrl = (u) => {
  if (!u) return false;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Women");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState(["P", "M", "G"]);
  const [bestSeller, setBestSeller] = useState(false);

  // Links por tamanho (P/M/G)
  const [yampiLinks, setYampiLinks] = useState({
    P: "",
    M: "",
    G: "",
  });

  // tamanhos efetivamente selecionados (ordem fixa P,M,G)
  const activeSizes = useMemo(
    () => ["P", "M", "G"].filter((s) => sizes.includes(s)),
    [sizes]
  );

  const handleToggleSize = (s) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleChangeLink = (sizeKey, val) => {
    setYampiLinks((prev) => ({ ...prev, [sizeKey]: val }));
  };

  const validateSelectedSizeLinks = () => {
    // Exigir link válido apenas para tamanhos selecionados
    for (const s of activeSizes) {
      const link = (yampiLinks[s] || "").trim();
      if (!isValidUrl(link)) {
        toast.error(`Informe um link válido para o tamanho ${s}.`);
        return false;
      }
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!validateSelectedSizeLinks()) return;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestSeller ? "true" : "false");

      // Envia somente os links dos tamanhos selecionados
      const filteredLinks = activeSizes.reduce((acc, s) => {
        const v = (yampiLinks[s] || "").trim();
        if (v) acc[s] = v;
        return acc;
      }, {});
      formData.append("yampiLinks", JSON.stringify(filteredLinks));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const { data } = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );

      if (data?.success) {
        toast.success("✅ Produto adicionado com sucesso!");

        // Resetar estado
        setName("");
        setDescription("");
        setPrice("");
        setCategory("Women");
        setSubCategory("Topwear");
        setSizes(["P", "M", "G"]);
        setBestSeller(false);
        setYampiLinks({ P: "", M: "", G: "" });

        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
      } else {
        toast.error(data?.message || "Falha ao adicionar produto");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao adicionar produto");
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full mt-10 max-w-3xl mx-auto px-4 py-8 sm:px-6 md:px-10 gap-6 bg-white rounded-2xl shadow-xl border border-gray-100"
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="form"
      aria-label="Formulário de adição de novo produto"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">
        Adicionar Novo Produto
      </h2>

      {/* Upload de Imagens */}
      <section>
        <p className="mb-3 font-medium text-gray-700">
          Upload de imagens do produto (até 4)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[image1, image2, image3, image4].map((img, index) => {
            const setters = [setImage1, setImage2, setImage3, setImage4];
            const setImage = setters[index];
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
                    !img
                      ? `Upload da imagem ${index + 1}`
                      : `Pré-visualização da imagem ${index + 1}`
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

      {/* Nome */}
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
          placeholder="Ex: Short Fitness com Bolso Azul"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
        />
      </div>

      {/* Descrição (opcional) */}
      <div>
        <label
          htmlFor="productDescription"
          className="block mb-2 font-medium text-gray-700"
        >
          Descrição
        </label>
        <textarea
          id="productDescription"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder="Opcional"
          className="w-full px-4 py-2 h-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 resize-none"
        />
      </div>

      {/* Categoria / Subcategoria / Preço */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Categoria
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            <option value="Topwear">Parte Superior</option>
            <option value="Bottomwear">Parte Inferior</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Preço
          </label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            placeholder="Ex: 115"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
        </div>
      </div>

      {/* Tamanhos (P/M/G por padrão) */}
      <div>
        <p className="mb-2 font-medium text-gray-700">Tamanhos Disponíveis</p>
        <div className="flex flex-wrap gap-3">
          {["P", "M", "G"].map((s) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => handleToggleSize(s)}
              className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-all ${
                sizes.includes(s)
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Links por tamanho (Yampi) */}
      <div>
        <p className="mb-2 font-medium text-gray-700">
          Links de compra por tamanho (Yampi)
        </p>
        <div className="grid grid-cols-1 gap-3">
          {activeSizes.map((s) => (
            <div
              key={s}
              className="grid grid-cols-1 sm:grid-cols-[60px_1fr] items-center gap-3"
            >
              <label className="text-sm font-medium text-gray-700">{s}</label>
              <input
                type="url"
                placeholder={`https://… (link do tamanho ${s})`}
                value={yampiLinks[s]}
                onChange={(e) => handleChangeLink(s, e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Para cada tamanho selecionado acima, informe o link de checkout
          correspondente copiado da Yampi.
        </p>
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

      <motion.button
        type="submit"
        className="mt-6 bg-gray-900 text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Adicionar Produto
      </motion.button>
    </motion.form>
  );
};

export default Add;
