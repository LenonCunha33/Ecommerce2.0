import { assets } from '../assets/assets';
import NewsLetterBox from '../Components/NewsLetterBox';
import Title from '../Components/Title';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'SOBRE'} text2={'NÓS'} />
      </div>

      <div className='flex flex-col md:flex-row gap-16 my-10'>
        <img
          src={assets.about_img}
          alt=''
          className='w-full md:max-w-[450px] '
        />

        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>
            A Forever nasceu da paixão por inovação e do desejo de revolucionar a forma como as pessoas fazem compras online. Nossa jornada começou com uma ideia simples: oferecer uma plataforma onde os clientes possam facilmente descobrir, explorar e comprar uma ampla variedade de produtos no conforto de suas casas.
          </p>
          <p>
            Desde o nosso início, trabalhamos incansavelmente para reunir uma seleção diversificada de produtos de alta qualidade que atendem a todos os gostos e preferências. De moda e beleza a eletrônicos e itens essenciais para o lar, oferecemos uma extensa coleção de marcas e fornecedores confiáveis.
          </p>
          <b className='text-gray-800'>Nossa Missão</b>
          <p>
            A missão da Forever é capacitar os clientes com escolha, conveniência e confiança. Somos dedicados a proporcionar uma experiência de compra perfeita que supera as expectativas — desde a navegação e o pedido até a entrega e além.
          </p>
        </div>
      </div>

      <div className='py-4 text-2xl'>
        <Title text1={'POR QUE'} text2={'ESCOLHER A GENTE'} />
      </div>

      <div className='flex flex-col md:flex-row mb-20 text-sm gap-4'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Garantia de Qualidade</b>
          <p className='text-gray-600'>
            Temos orgulho em oferecer apenas produtos da mais alta qualidade, que atendem aos nossos rigorosos padrões de durabilidade, desempenho e valor.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Comodidade</b>
          <p className='text-gray-600'>
            Nosso site e aplicativo móvel fáceis de usar tornam simples navegar, comparar e comprar produtos em qualquer lugar.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Atendimento ao Cliente Excepcional</b>
          <p className='text-gray-600'>
            Nossa equipe dedicada de atendimento ao cliente está disponível 24 horas por dia para ajudar com qualquer dúvida ou problema que você possa ter.
          </p>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  );
};

export default About;
