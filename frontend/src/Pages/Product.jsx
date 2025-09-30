import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import RelatedProducts from "../Components/RelatedProducts";
import { motion, AnimatePresence } from "framer-motion";

/* Helpers */
const getAvailableSizes = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length) {
    const actives = product.variants
      .filter((v) => v?.isActive !== false && String(v?.size).trim())
      .map((v) => String(v.size).trim().toUpperCase());
    if (actives.length) return Array.from(new Set(actives));
  }
  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.map((s) => String(s).trim().toUpperCase());
  }
  return [];
};

const buildSizeLinks = (product) => {
  if (product?.yampiLinks && typeof product.yampiLinks === "object" && Object.keys(product.yampiLinks).length) {
    return product.yampiLinks;
  }
  if (product?.yampiLink) {
    const sizes = getAvailableSizes(product);
    if (sizes.length) return sizes.reduce((acc, s) => ((acc[s] = product.yampiLink), acc), {});
    return { ÚNICO: product.yampiLink };
  }
  return {};
};

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
        <motion.div
          className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
              Fechar
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Product = () => {
  const { productId } = useParams();
  const { products, currency, backendUrl, user, isLoggedIn, isFavorite, toggleFavorite } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openSizeModal, setOpenSizeModal] = useState(false);

  useEffect(() => {
    const found = (products || []).find((p) => p._id === productId);
    if (found) {
      setProduct(found);
      setActiveIndex(0);
    }
  }, [productId, products]);

  const images = product?.image ?? [];
  const mainSrc = images[activeIndex] || "";

  const sizeLinks = useMemo(() => buildSizeLinks(product), [product]);
  const fav = product ? isFavorite(product._id) : false;

  // ——— Notificação de abandono (enviada no clique do tamanho) ———
  const notifyAbandoned = (size, link) => {
    try {
      const email = user?.email;
      if (!email || !link) return;

      const payload = {
        email,
        name: user?.name,
        productId: product?._id,
        productName: product?.name,
        size,
        link,
        image: product?.image?.[0],
      };

      const url = `${backendUrl}/api/abandoned/notify`;
      const body = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    } catch { /* ignore */ }
  };

  const goToSizeLink = (tamanho) => {
    const link = sizeLinks?.[tamanho];
    if (!link) return;
    if (isLoggedIn) notifyAbandoned(tamanho, link);
    window.location.assign(link);
  };

  const handleBuy = (e) => {
    e.preventDefault();
    const entries = Object.entries(sizeLinks);
    if (entries.length === 1) {
      const [tamanho, link] = entries[0];
      if (isLoggedIn) notifyAbandoned(tamanho, link);
      window.location.assign(link);
    } else {
      setOpenSizeModal(true);
    }
  };

  if (!product) {
    return (
      <div className="h-96 flex items-center justify-center animate-pulse text-gray-400 text-xl">
        Carregando produto...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-12 px-6 md:px-12 max-w-screen-xl mx-auto text-lg"
    >
      <div className="flex flex-col lg:flex-row gap-14">
        {/* Imagens */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-1/2">
          {/* thumbs fixas */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] w-full lg:w-28 flex-none">
            {images.map((src, index) => (
              <motion.img
                whileHover={{ scale: 1.05 }}
                key={`${src}-${index}`}
                src={src}
                alt={`Miniatura ${index + 1} de ${product.name}`}
                onClick={() => setActiveIndex(index)}
                loading="lazy"
                draggable={false}
                className={[
                  "w-24 h-24 object-cover cursor-pointer border rounded-md",
                  "flex-none shrink-0",
                  activeIndex === index ? "border-orange-500" : "border-gray-200",
                ].join(" ")}
              />
            ))}
          </div>

          {/* imagem principal */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto rounded-2xl shadow-lg bg-gray-100 overflow-hidden"
              style={{ width: "100%", maxWidth: 500 }}
            >
              <div className="w-full" style={{ aspectRatio: "3/4" }}>
                <img
                  src={mainSrc}
                  alt={product.name}
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="w-full lg:w-1/2 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 leading-snug">{product.name}</h1>
          <p className="text-4xl font-bold text-gray-900">
            {currency}{product.price}
          </p>
          {!!product.description && (
            <p className="text-gray-600 text-[1.05rem] leading-relaxed">{product.description}</p>
          )}

          {/* Ações */}
          <div className="flex items-center gap-3">
            <a
              href="#comprar"
              onClick={handleBuy}
              className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white py-4 px-8 rounded-md shadow transition-colors text-lg"
            >
              COMPRAR
            </a>
            <button
              onClick={() => toggleFavorite(product)}
              className={`rounded-md px-4 py-3 border ${fav ? "bg-red-600 text-white border-red-600" : "border-gray-300"}`}
            >
              {fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </button>
          </div>

          <ul className="text-base text-gray-600 mt-5 space-y-1">
            <li>✓ Produto 100% original</li>
            <li>✓ Política de troca e devolução em até 7 dias</li>
          </ul>
        </div>
      </div>

      {/* Relacionados */}
      <div className="mt-20">
        <RelatedProducts category={product.category} subCategory={product.subCategory} />
      </div>

      {/* Modal: seleção de tamanho (links Yampi) */}
      <Modal open={openSizeModal} onClose={() => setOpenSizeModal(false)} title="Escolha o tamanho para continuar a compra">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(sizeLinks).length === 0 && (
            <p className="col-span-3 text-sm text-gray-600">Nenhum link configurado para este produto.</p>
          )}
          {Object.entries(sizeLinks).map(([tamanho, _link]) => (
            <button
              key={tamanho}
              onClick={() => goToSizeLink(tamanho)}
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {tamanho}
            </button>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
};

export default Product;
