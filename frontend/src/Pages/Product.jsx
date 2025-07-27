import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../Components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productsData, setProductsData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductsData = () => {
    products.map((product) => {
      if (product._id === productId) {
        setProductsData(product);
        setImage(product.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductsData();
  }, [productId, products]);

  return productsData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* ---------------------- Dados do Produto ---------------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* ---------------------- Imagens do Produto ---------------------- */}

        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row '>
          {/* ---------------------- Lista de Imagens ---------------------- */}
          <div className='flex sm:flex-col  overflow-x-auto sm:overflow-y-scroll justify-between  sm:justify-normal sm:w-[18.7%] w-full'>
            {productsData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt='produto'
                onClick={() => setImage(item)}
                className='cursor-pointer w-[24%]  sm:w-full sm:mb-3 flex-shrink-0 object-cover'
              />
            ))}
          </div>

          {/* ---------------------- Imagem Principal ---------------------- */}
          <div className='w-full sm:w-[80%]'>
            <img
              src={image}
              alt='produto'
              className='w-full h-auto object-cover'
            />
          </div>
        </div>

        {/* ---------------------- Detalhes do Produto ---------------------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productsData.name}</h1>

          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt='' className='w-3 5' />
            <img src={assets.star_icon} alt='' className='w-3 5' />
            <img src={assets.star_icon} alt='' className='w-3 5' />
            <img src={assets.star_icon} alt='' className='w-3 5' />
            <img src={assets.star_dull_icon} alt='' className='w-3 5' />

            <p className='pl-2'>(122)</p>
          </div>

          <p className='mt-5 text-3xl font-medium'>
            {currency}
            {productsData.price}
          </p>
          <p className='mt-5 text-gray-500 md:w-4/5 '>
            {productsData.description}
          </p>

          {/* Seleção de Tamanho */}
          <div className='flex flex-col gap-4 my-8'>
            <p>Selecionar Tamanho</p>
            <div className='flex gap-2'>
              {productsData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSize(item);
                  }}
                  className={`w-8 h-8 border bg-gray-100 flex items-center justify-center cursor-pointer
                  ${item === size ? 'border-orange-500' : ''}
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addToCart(productsData._id, size)}
            className='bg-black text-white py-3 px-8 text-sm active:bg-gray-700 cursor-pointer'
          >
            ADICIONAR AO CARRINHO
          </button>

          <hr className='mt-8 sm:w-4/5' />

          <div className='flex flex-col gap-1 mt-5 text-sm text-gray-500'>
            <p>Produto 100% original</p>
            <p>Entrega gratuita para pedidos acima de R$ 49</p>
            <p>Política de troca e devolução fácil em até 7 dias</p>
          </div>
        </div>
      </div>

      {/* ---------------------- Descrição e Avaliações ---------------------- */}
      <div className='mt-10'>
        <div className='flex'>
          <b className='px-5 py-3 text-sm border'>Descrição</b>
          <p className='px-5 py-3 text-sm border'>Avaliações (122)</p>
        </div>

        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>
            Um site de e-commerce é uma plataforma online que facilita a compra
            e venda de produtos ou serviços pela internet. Ele funciona como um
            mercado virtual onde empresas e indivíduos podem exibir seus
            produtos, interagir com clientes e realizar transações sem a
            necessidade de uma presença física. Os sites de e-commerce ganharam
            enorme popularidade devido à sua conveniência, acessibilidade e
            alcance global.
          </p>
          <p>
            Sites de e-commerce normalmente exibem produtos ou serviços com
            descrições detalhadas, imagens, preços e variações disponíveis (por
            exemplo, tamanhos, cores). Cada produto geralmente possui sua
            própria página com todas as informações relevantes.
          </p>
        </div>
      </div>

      {/* ---------------------- Produtos Relacionados ---------------------- */}
      <RelatedProducts
        category={productsData.category}
        subCategory={productsData.subCategory}
      />
    </div>
  ) : (
    <div className='opacity-0'></div>
  );
};

export default Product;
