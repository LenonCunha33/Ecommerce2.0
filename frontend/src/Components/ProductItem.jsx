import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  const [currentImage, setCurrentImage] = useState(image[0]);
  const [nextImage, setNextImage] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let timeout;
    let index = 1;

    if (hovering && image.length > 1) {
      const changeImage = () => {
        if (index < image.length) {
          setNextImage(image[index]); // nova imagem vai entrar
          setFade(true); // inicia fade
          setTimeout(() => {
            setCurrentImage(image[index]); // troca imagem principal
            setFade(false); // finaliza fade
            setNextImage(null);
            index++;
            timeout = setTimeout(changeImage, 800);
          }, 300); // duração do fade
        } else {
          // volta para a principal
          setTimeout(() => {
            setNextImage(image[0]);
            setFade(true);
            setTimeout(() => {
              setCurrentImage(image[0]);
              setFade(false);
              setNextImage(null);
            }, 300);
          }, 800);
        }
      };
      changeImage();
    } else {
      setCurrentImage(image[0]);
      setNextImage(null);
      setFade(false);
    }

    return () => clearTimeout(timeout);
  }, [hovering, image]);

  return (
    <Link
      className="text-gray-700 cursor-pointer block"
      to={`/product/${id}`}
    >
      <div
        className="overflow-hidden rounded-xl shadow-md relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => setHovering(true)}
        onTouchEnd={() => setHovering(false)}
      >
        {/* Imagem atual sempre visível */}
        <img
          className="w-full h-100 object-cover object-center"
          src={currentImage}
          alt={name}
          loading="lazy"
        />

        {/* Imagem nova sobreposta com fade */}
        {nextImage && (
          <img
            className={`w-full h-100 object-cover object-center absolute top-0 left-0 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            src={nextImage}
            alt={name}
          />
        )}
      </div>

      <p className="pt-3 pb-1 text-sm font-medium">{name}</p>
      <p className="text-sm font-semibold">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
