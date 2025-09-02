import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const Collection = () => {
  const { products, search } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [sortType, setSortType] = useState('relevent');

  const [searchParams] = useSearchParams();

  // 📌 Inicializa filtros a partir da URL
  useEffect(() => {
    const typeFromURL = searchParams.get('type');
    if (typeFromURL) {
      setTypeFilter([typeFromURL]);
    }
  }, [searchParams]);

  const toggleCategory = (e) => {
    const value = e.target.value;
    category.includes(value)
      ? setCategory((prev) => prev.filter((item) => item !== value))
      : setCategory((prev) => [...prev, value]);
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    subCategory.includes(value)
      ? setSubCategory((prev) => prev.filter((item) => item !== value))
      : setSubCategory((prev) => [...prev, value]);
  };

  const toggleTypeFilter = (e) => {
    const value = e.target.value;
    typeFilter.includes(value)
      ? setTypeFilter((prev) => prev.filter((item) => item !== value))
      : setTypeFilter((prev) => [...prev, value]);
  };

  const applyFilter = () => {
    if (!products || products.length === 0) return;

    let productsCopy = products.filter((product) => product.visible !== false);

    // 🔍 Busca
    if (search && search.trim() !== '') {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    // 📂 Categoria
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    // 👖 Subcategoria
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // 🎯 Tipo (Top, Macacão, Short, etc.)
    if (typeFilter.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        typeFilter.some((tipo) =>
          item.name.toLowerCase().includes(tipo.toLowerCase())
        )
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProducts = () => {
    let sortedProducts = [...filterProducts];
    switch (sortType) {
      case 'low-high':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        applyFilter();
        return;
    }
    setFilterProducts(sortedProducts);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, typeFilter, search, products]);

  useEffect(() => {
    sortProducts();
  }, [sortType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row gap-5 sm:gap-10 pt-10 border-t px-4 sm:px-10 lg:px-20"
    >
      {/* Filtros */}
      <div className="sm:min-w-56">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="mb-3 text-xl font-semibold flex items-center cursor-pointer gap-2"
        >
          Filtros
          <img
            src={assets.dropdown_icon}
            alt="dropdown"
            className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`}
          />
        </p>

        {/* Categoria 
        <div
          className={`border border-gray-300 px-4 py-4 rounded-md mb-6 ${
            showFilter ? 'block' : 'hidden'
          } sm:block`}
        >
          <p className="mb-3 font-semibold text-sm text-gray-700">Categoria</p>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                value="Women"
                onChange={toggleCategory}
                checked={category.includes('Women')}
                className="accent-black"
              />
              Feminino
            </label>
          </div>
        </div>*/}

        {/* Subcategoria 
        <div
          className={`border border-gray-300 px-4 py-4 rounded-md mb-6 ${
            showFilter ? 'block' : 'hidden'
          } sm:block`}
        >
          <p className="mb-3 font-semibold text-sm text-gray-700">Categoria de Uso</p>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            {['Topwear', 'Bottomwear'].map((sub) => (
              <label key={sub} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={sub}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(sub)}
                  className="accent-black"
                />
                {sub === 'Topwear' ? 'Parte de Cima' : 'Parte de Baixo'}
              </label>
            ))}
          </div>
        </div> */}

        {/* Tipo */}
        <div
          className={`border border-gray-300 px-4 py-4 rounded-md ${
            showFilter ? 'block' : 'hidden'
          } sm:block`}
        >
          <p className="mb-3 font-semibold text-sm text-gray-700">Segmento</p>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            {['Top', 'Macacão', 'Short', 'Calça'].map((tipo) => (
              <label key={tipo} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={tipo}
                  onChange={toggleTypeFilter}
                  checked={typeFilter.includes(tipo)}
                  className="accent-black"
                />
                {tipo}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
          <Title text1={'TODOS OS'} text2={'PRODUTOS'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
          >
            <option value="relevent">Ordenar por: Relevância</option>
            <option value="low-high">Menor Preço</option>
            <option value="high-low">Maior Preço</option>
          </select>
        </div>

        {filterProducts.length > 0 ? (
          <motion.div
            layout
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6"
          >
            <AnimatePresence>
              {filterProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductItem
                    id={product._id}
                    image={product.image}
                    name={product.name}
                    price={product.price}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <p className="text-gray-500 mt-4">Nenhum produto encontrado.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Collection;
