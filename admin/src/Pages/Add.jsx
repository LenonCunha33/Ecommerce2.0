import { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('price', price);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('bestseller', bestSeller ? 'true' : 'false');
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setPrice('');
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
      toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 md:px-10 gap-6 bg-white rounded-xl shadow-md"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800">Adicionar Novo Produto</h2>

      {/* Upload de Imagem */}
      <div>
        <p className="mb-2 font-medium text-gray-700">Enviar Imagens</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[image1, image2, image3, image4].map((img, index) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <label
                htmlFor={`image${index + 1}`}
                key={index}
                className="w-full h-24 sm:h-28 border rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition"
              >
                <img
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Nome do Produto */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Nome do Produto</label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          placeholder="Digite aqui"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Descrição</label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder="Escreva aqui..."
          required
          className="w-full px-4 py-2 h-28 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
        />
      </div>

      {/* Categoria, Subcategoria e Preço */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Categoria</label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            
            <option value="Women">Feminino</option>
            
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Subcategoria</label>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="Topwear">Parte de Cima</option>
            <option value="Bottomwear">Parte de Baixo</option>
            
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Preço</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            placeholder="2500"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Tamanhos */}
      <div>
        <p className="mb-2 font-medium text-gray-700">Tamanhos Disponíveis</p>
        <div className="flex flex-wrap gap-3">
          {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => (
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
              className={`px-4 py-1 rounded-full border text-sm font-medium transition-all ${
                sizes.includes(sizeOption)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
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
          className="accent-gray-800 w-4 h-4"
        />
        <label htmlFor="bestseller" className="text-gray-700 cursor-pointer">
          Adicionar aos Mais Vendidos
        </label>
      </div>

      {/* Botão de Envio */}
      <motion.button
        type="submit"
        className="mt-4 bg-gray-800 text-white font-semibold px-6 py-2 rounded-full hover:bg-gray-700 transition"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        Adicionar Produto
      </motion.button>
    </motion.form>
  );
};

export default Add;
