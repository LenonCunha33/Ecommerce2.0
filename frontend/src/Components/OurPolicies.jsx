import { assets } from '../assets/assets';

const OurPolicies = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
      <div className=''>
        <img src={assets.exchange_icon} alt='' className='w-12 m-auto mb-5 ' />
        <p className='font-semibold'>Política de Troca Fácil</p>
        <p className='text-gray-400'>Oferecemos uma política de troca sem complicações</p>
      </div>
      <div className=''>
        <img src={assets.quality_icon} alt='' className='w-12 m-auto mb-5 ' />
        <p className='font-semibold'>Política de devolução em 7 dias</p>
        <p className='text-gray-400'>Oferecemos uma política de devolução de 7 dias</p>
      </div>
      <div className=''>
        <img src={assets.support_img} alt='' className='w-12 m-auto mb-5 ' />
        <p className='font-semibold'>Melhor suporte ao cliente</p>
        <p className='text-gray-400'>Oferecemos suporte ao cliente 24/7</p>
      </div>
    </div>
  );
};

export default OurPolicies;
