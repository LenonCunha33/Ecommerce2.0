import { motion } from 'framer-motion';

const NewsLetterBox = () => {
  const onSubmitHandler = (e) => {
    e.preventDefault();
    alert('Inscrição realizada com sucesso!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center px-4 sm:px-8 py-16 bg-white"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
        Inscreva-se agora e ganhe 20% de desconto
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-xl mx-auto">
        Seja o primeiro a saber sobre novidades, promoções e descontos!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4"
      >
        <input
          type="email"
          placeholder="Digite seu e-mail"
          required
          className="flex-1 w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none transition-all duration-200 text-sm sm:text-base"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className="bg-black text-white px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium transition duration-300"
        >
          Inscrever-se
        </motion.button>
      </form>
    </motion.div>
  );
};

export default NewsLetterBox;
