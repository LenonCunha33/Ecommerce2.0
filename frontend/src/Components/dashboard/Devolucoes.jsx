import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Devolucoes() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white min-h-[70vh]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
      >
        Devoluções & Trocas
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-gray-600 max-w-2xl text-center mb-6 leading-relaxed"
      >
        Nosso objetivo é garantir sua total satisfação.
        Para iniciar um processo de devolução, pedimos que entre em contato
        com nosso <span className="font-semibold text-gray-900">suporte</span> — assim poderemos entender o motivo,
        avaliar a condição do produto e indicar a melhor forma de retorno.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full border border-gray-200"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Como funciona:</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
          <li>Entre em contato com nosso time de suporte informando o motivo da devolução.</li>
          <li>Nossa equipe irá avaliar seu caso e indicar a melhor opção de envio.</li>
          <li>Após o recebimento, o produto será analisado para aprovação da devolução ou troca.</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Link
          to="/entrega"
          className="mt-8 inline-block bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          Consulte nossa Política de Entrega
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-4 text-sm text-gray-500"
      >
        Ao prosseguir, você confirma que leu e concorda com nossa política.
      </motion.p>
    </div>
  );
}
