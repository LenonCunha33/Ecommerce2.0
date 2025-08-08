import { assets } from '../assets/assets';
import NewsLetterBox from '../Components/NewsLetterBox';
import Title from '../Components/Title';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className='px-4 sm:px-8 lg:px-20 space-y-20'>
      {/* Título principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-3xl text-center border-t pt-10'
      >
        <Title text1='SOBRE' text2='NÓS' />
      </motion.div>

      {/* Sessão principal - imagem + descrição */}
      <div className='flex flex-col md:flex-row gap-10 items-center'>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          src={assets.about_img}
          alt='Sobre nós'
          className='w-full md:max-w-md rounded-xl shadow-md object-cover'
        />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='flex flex-col gap-6 text-gray-700 md:w-3/5 text-base leading-relaxed'
        >
          <p>
            A <span className='font-semibold text-gray-900'>Forever</span> nasceu da paixão por inovação e do desejo de revolucionar a forma como as pessoas fazem compras online. Nossa jornada começou com uma ideia simples: oferecer uma plataforma onde os clientes possam facilmente descobrir, explorar e comprar uma ampla variedade de produtos no conforto de suas casas.
          </p>
          <p>
            Desde o nosso início, trabalhamos incansavelmente para reunir uma seleção diversificada de produtos de alta qualidade que atendem a todos os gostos e preferências. De moda e beleza a eletrônicos e itens essenciais para o lar, oferecemos uma extensa coleção de marcas e fornecedores confiáveis.
          </p>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Nossa Missão</h3>
            <p>
              Capacitar os clientes com escolha, conveniência e confiança. Somos dedicados a proporcionar uma experiência de compra perfeita que supera as expectativas — desde a navegação e o pedido até a entrega e além.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Título seção motivos */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className='text-3xl text-center'
      >
        <Title text1='POR QUE' text2='ESCOLHER A GENTE' />
      </motion.div>

      {/* Cards de motivo */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-sm'>
        {[
          {
            title: 'Garantia de Qualidade',
            text: 'Temos orgulho em oferecer apenas produtos da mais alta qualidade, que atendem aos nossos rigorosos padrões de durabilidade, desempenho e valor.',
          },
          {
            title: 'Comodidade',
            text: 'Nosso site e aplicativo móvel fáceis de usar tornam simples navegar, comparar e comprar produtos em qualquer lugar.',
          },
          {
            title: 'Atendimento ao Cliente Excepcional',
            text: 'Nossa equipe dedicada de atendimento ao cliente está disponível 24 horas por dia para ajudar com qualquer dúvida ou problema que você possa ter.',
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.2 }}
            viewport={{ once: true }}
            className='bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300'
          >
            <h4 className='font-bold text-gray-800 text-base'>{item.title}</h4>
            <p className='text-gray-600'>{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <NewsLetterBox />
      </motion.div>
    </div>
  );
};

export default About;
