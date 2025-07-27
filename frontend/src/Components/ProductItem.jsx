// FRONTEND - Importação de bibliotecas React
import React, { useContext } from "react";

// FRONTEND COM BACKEND INDIRETO - Pega informações do contexto global
// Esse contexto pode ter sido preenchido com dados vindos de uma API (backend)
import { ShopContext } from "../Context/ShopContext";

// FRONTEND - Para navegação entre páginas sem recarregar
import { Link } from "react-router-dom";

// COMPONENTE DE PRODUTO
const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext); // Usa moeda do contexto (ex: R$ ou US$)

  return (
    // FRONTEND - Componente de link que leva à página de detalhes do produto
    <Link
      className="text-gray-700 cursor-pointer block"
      to={`/product/${id}`} // URL dinâmica para detalhes
    >
      {/* IMAGEM DO PRODUTO */}
      <div className="overflow-hidden rounded-xl shadow-md">
        <img
          className="w-full h-100 object-cover object-center transition-transform duration-300 hover:scale-110"
          src={image[0]} // primeira imagem do array
          alt={name} // acessibilidade
          loading="lazy" // desempenho
        />
      </div>

      {/* NOME DO PRODUTO */}
      <p className="pt-3 pb-1 text-sm font-medium">{name}</p>

      {/* PREÇO COM MOEDA */}
      <p className="text-sm font-semibold">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
