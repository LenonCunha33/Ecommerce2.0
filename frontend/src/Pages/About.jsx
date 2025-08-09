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
        className='text-3xl text-center mb-2 border-t pt-10'
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
          className='flex flex-col gap-2 text-gray-700 md:w-3/5 text-base leading-relaxed'
        >
          
<p>
  A <span className="font-semibold text-gray-900">Marima</span> nasceu no ambiente digital com o propósito de simplificar e transformar a forma como você compra roupas fitness. Nossa história começou com uma visão clara: unir praticidade, agilidade na entrega e zero complicação na hora de receber seu produto, tudo sem abrir mão de estilo e autenticidade.
</p>
<p>
  Desde o início, dedicamo-nos a criar peças que inspiram moda, funcionalidade e confiança. Cada item é pensado para valorizar sua autoestima e acompanhar seu ritmo, seja no treino ou no dia a dia. Mais do que roupas, entregamos motivação e bem-estar para mulheres que buscam se sentir bem por dentro e por fora.
</p>
<p>
  Nossa coleção é desenvolvida com atenção aos detalhes, priorizando tecidos de alta performance, caimento perfeito e design moderno. Trabalhamos com processos ágeis para garantir que cada pedido chegue até você rapidamente, sem burocracias e com toda segurança. Queremos que a experiência de compra seja tão prazerosa quanto vestir a peça pela primeira vez.
</p>
<p>
  Na Marima, acreditamos que moda fitness é mais do que vestir — é um estilo de vida. Por isso, estamos sempre inovando e acompanhando tendências, para que você tenha à disposição peças que expressem sua personalidade e incentivem sua jornada rumo a uma vida mais saudável e confiante.
</p>
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nossa Missão</h3>
  <p>
    Inspirar saúde e autoestima através da moda fitness, oferecendo produtos de qualidade e uma experiência de compra moderna, acolhedora e eficiente — do clique à entrega.
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
            text: 'Nosso site com design simples facil de usar tornam simples navegar, comparar e comprar produtos em qualquer lugar.',
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
