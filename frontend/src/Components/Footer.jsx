import { assets } from '../assets/assets';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className='f'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm '>
        <div className=''>
          <img src={assets.logo} alt='' className='mb-5 w-32 ' />
          <p className='w-full sm:w-2/3 text-gray-600'>
            Compre com a Forever e experimente a conveniência das compras online
            como nunca antes.
          </p>
        </div>

        <div className=''>
          <p className='text-xl font-medium mb-5'>EMPRESA</p>

          <ul className='flex flex-col flex-1 text-gray-600 cursor-pointer'>
            <li onClick={scrollToTop} className='mb-2'>
              Início
            </li>
            <li onClick={scrollToTop} className='mb-2'>
              Sobre Nós
            </li>
            <li onClick={scrollToTop} className='mb-2'>
              Entrega
            </li>
            <li onClick={scrollToTop} className='mb-2'>
              Política de Privacidade
            </li>
          </ul>
        </div>

        <div className=''>
          <p className='text-xl font-medium mb-5'>ENTRE EM CONTATO</p>
          <ul className='flex flex-col flex-1 text-gray-600'>
            <li className='mb-2'>+123 456 7890</li>
            <li className='mb-2'>contact@forevryou.com </li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
          Copyright 2025@ forever.com - Todos os Direitos Reservados
        </p>
      </div>
    </div>
  );
};

export default Footer;
