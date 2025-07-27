import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevent');

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

  const applyFilter = () => {
    if (!products || products.length === 0) return; // Garante que os produtos estejam disponíveis

    let productsCopy = products.slice(); // Cria uma cópia superficial dos produtos

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy); // Atualiza o estado dos produtos filtrados
  };

  const sortProducts = () => {
    if (filterProducts.length === 0) return; // Garante que há produtos para ordenar

    let filteredProdCopy = [...filterProducts]; // Cria uma cópia superficial dos produtos filtrados

    switch (sortType) {
      case 'low-high':
        setFilterProducts(filteredProdCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(filteredProdCopy.sort((a, b) => b.price - a.price));
        break;

      default:
        setFilterProducts(() => {
          applyFilter();
        });

        break;
    }

    setFilterProducts(filteredProdCopy); // Atualiza o estado dos produtos filtrados
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProducts();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Opções de Filtro */}

      <div className='min-w-52'>
        <p
          onClick={() => {
            setShowFilter(!showFilter);
          }}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          Filtros
          <img
            src={assets.dropdown_icon}
            alt=''
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
          />
        </p>

        {/* Filtro por Categoria */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? '' : 'hidden'
          } 
            sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>CATEGORIAS</p>

          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Men'}
                onChange={toggleCategory}
              />
              MASCULINO
            </p>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Women'}
                onChange={toggleCategory}
              />
              FEMININO
            </p>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Kids'}
                onChange={toggleCategory}
              />
              INFANTIL
            </p>
          </div>
        </div>

        {/* Filtro por Subcategoria */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? '' : 'hidden'
          } 
            sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>TIPOS</p>

          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Topwear'}
                onChange={toggleSubCategory}
              />
              Parte de Cima
            </p>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Bottomwear'}
                onChange={toggleSubCategory}
              />
              Parte de Baixo
            </p>
            <p className='flex gap-2'>
              <input
                type='checkbox'
                className='w-3'
                value={'Winterwear'}
                onChange={toggleSubCategory}
              />
              Roupas de Inverno
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito --> Lista de Produtos */}

      <div className='flex-1'>
        {/* Título */}
        <div className='flex justify-between text-sm sm:text-xl lg:text-2xl mb-4'>
          <Title text1={'TODAS AS'} text2={'COLEÇÕES'} />

          {/* Ordenação dos Produtos */}
          <select
            onChange={(e) => {
              setSortType(e.target.value);
            }}
            value={sortType}
            className='border border-gray-300 text-sm px-2'
          >
            <option value='relevent'>Ordenar por: Relevância</option>
            <option value='low-high'>Ordenar por: Menor Preço</option>
            <option value='high-low'>Ordenar por: Maior Preço</option>
          </select>
        </div>

        {/* Lista de Produtos */}
        <div className='grid grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((product) => (
            <ProductItem
              key={product._id}
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
