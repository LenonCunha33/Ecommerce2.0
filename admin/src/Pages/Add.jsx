import { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

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

      const response = await axios.post(
        backendUrl + '/api/product/add',
        formData,
        {
          headers: { token },
        }
      );
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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col w-full items-start gap-3'
    >
      {/* Upload de Imagem */}
      <div>
        <p className='mb-2'>Enviar Imagens</p>
        <div className='flex gap-2'>
          {[image1, image2, image3, image4].map((img, index) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <label htmlFor={`image${index + 1}`} key={index}>
                <img
                  className='w-20 cursor-pointer'
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=''
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type='file'
                  id={`image${index + 1}`}
                  hidden
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Nome do Produto */}
      <div className='w-full'>
        <p className='mb-2'>Nome do Produto</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2'
          type='text'
          placeholder='Digite aqui'
          required
        />
      </div>

      {/* Descrição do Produto */}
      <div className='w-full'>
        <p className='mb-2'>Descrição do Produto</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2'
          placeholder='Escreva aqui...'
          required
        />
      </div>

      {/* Categoria e Subcategoria */}
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Categoria</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className='w-full  px-3 py-2'
          >
            <option value='Men'>Masculino</option>
            <option value='Women'>Feminino</option>
            <option value='Kids'>Infantil</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Subcategoria</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            className='w-full  px-3 py-2'
          >
            <option value='Topwear'>Parte de Cima</option>
            <option value='Bottomwear'>Parte de Baixo</option>
            <option value='Winterwear'>Inverno</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Preço</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full sm:w-[120px] px-3 py-2'
            type='number'
            placeholder='2500'
            required
          />
        </div>
      </div>

      {/* Tamanhos do Produto */}
      <div>
        <p className='mb-2'>Tamanhos Disponíveis</p>
        <div className='flex gap-3'>
          {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => (
            <div
              key={sizeOption}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(sizeOption)
                    ? prev.filter((size) => size !== sizeOption)
                    : [...prev, sizeOption]
                )
              }
            >
              <p
                className={`${
                  sizes.includes(sizeOption) ? 'bg-pink-100' : 'bg-slate-200'
                }  px-3 py-1 cursor-pointer`}
              >
                {sizeOption}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Produto em Destaque */}
      <div className='flex items-center gap-2 mt-2'>
        <input
          onChange={() => setBestSeller((prev) => !prev)}
          checked={bestSeller}
          className='w-3 h-3 cursor-pointer'
          type='checkbox'
          id='bestseller'
        />
        <label htmlFor='bestseller' className='cursor-pointer'>
          Adicionar aos Mais Vendidos
        </label>
      </div>

      {/* Botão de Envio */}
      <button
        type='submit'
        className='bg-gray-800 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer'
      >
        Adicionar Produto
      </button>
    </form>
  );
};

export default Add;
