import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {
  // Extrai valores do contexto relacionados à busca e visibilidade a partir do ShopContext
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);

  // Estado local para controlar visibilidade e animação da barra de busca
  const [visible, setVisible] = useState(showSearch);
  const [animate, setAnimate] = useState('');

  // Obtém o caminho atual da URL
  const location = useLocation();

  // Efeito para atualizar a visibilidade e animação da barra de busca com base na URL e showSearch

  useEffect(() => {
    if (location.pathname.includes('collection')) {
      // Mostra a barra de busca e aplica animação de expansão se incluir a página 'collection'

      setVisible(true);
      setAnimate('animate-scale-up-center');
    } else {
      // Oculta a barra de busca se não incluir a página 'collection'
      setVisible(false);
    }
  }, [location, showSearch]); // Atualiza a visibilidade quando location ou showSearch mudarem

  const handleClose = () => {
    setAnimate('animate-scale-down-center');
    setTimeout(() => setShowSearch(false), 400); // Oculta a barra de busca após um atraso para coincidir com a duração da animação de recolhimento
  };

  // Renderiza condicionalmente a barra de busca com base nos estados de visibilidade e showSearch
  return visible && showSearch ? (
    <div className={`border-t border-b bg-gray-50 text-center ${animate} `}>
      <div className='w-[450px] inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-8 rounded-full '>
        <input
          type='text'
          placeholder='Buscar...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=' flex-1 outline-none bg-inherit text-sm '
        ></input>
        <img src={assets.search_icon} alt='' className='w-4' />
      </div>
      <img
        src={assets.cross_icon}
        alt=''
        className='w-4 h-4 ml-3 inline  cursor-pointer'
        onClick={handleClose}
      />
    </div>
  ) : null; // Não renderiza nada se visible ou showSearch for false
};

export default SearchBar;
