import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * CategoryHighlights
 * - Mantém todos os textos/copys existentes
 * - UI/UX modernizada com Tailwind + Framer Motion
 * - Cards responsivos com imagens bem recortadas, hover states e acessibilidade
 */
export default function CategoryHighlights({ items = [] }) {
  const reduce = useReducedMotion();

  // Container + itens: animações suaves e performáticas
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: reduce ? 0 : 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.45, ease: "easeOut" },
    },
  };

  return (
    <section
      className="px-4 sm:px-8 lg:px-20 py-12"
      aria-label="Destaques de categoria"
      role="region"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-screen-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {items.map((c, i) => (
          <motion.article
            key={i}
            variants={item}
            className="
              group relative overflow-hidden rounded-2xl bg-white
              ring-1 ring-black/5 shadow-sm transition
              will-change-transform transform-gpu
              hover:shadow-lg
              focus-within:shadow-lg
            "
          >
            <CategoryCardLink href={c.href} title={c.title} image={c.image} />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

/** Link do card com imagem + título
 * - Aspect ratio definido para evitar layout shift
 * - Skeleton shimmer até a imagem carregar
 * - Hover: leve zoom na imagem e sutil translate no conteúdo
 * - Acessível via teclado (focus-visible)
 */
function CategoryCardLink({ href, title, image }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      to={href}
      className="
        block h-full focus-visible:outline focus-visible:outline-2
        focus-visible:outline-black focus-visible:outline-offset-2
        touch-manipulation
      "
      aria-label={title}
    >
      {/* Mídia */}
      <div className="relative overflow-hidden">
        {/* Skeleton / shimmer */}
        <div
          aria-hidden="true"
          className={[
            "absolute inset-0",
            "bg-[linear-gradient(100deg,rgba(0,0,0,0.06)_20%,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.06)_60%)]",
            "bg-[length:200%_100%] animate-[shimmer_1.2s_ease_infinite]",
            loaded ? "opacity-0" : "opacity-100",
          ].join(" ")}
        />
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        <motion.figure
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="aspect-[4/3] md:aspect-[16/9] h-120 w-full overflow-hidden"
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={[
              "h-120 w-full object-cover",
              "transition-opacity duration-500",
              "group-hover:scale-[1.03] will-change-transform",
              loaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </motion.figure>

        {/* Máscara sutil para legibilidade sem alterar a cor de marca */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
      </div>

      {/* Conteúdo */}
      <motion.div
        initial={{ y: 6, opacity: 0.95 }}
        whileHover={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="p-4 sm:p-5"
      >
        <p className="text-base md:text-lg font-semibold tracking-tight text-neutral-900">
          {title}
        </p>
      </motion.div>
    </Link>
  );
}
