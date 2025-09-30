// src/Components/CategoryHighlights.jsx
import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryHighlights({ items = [] }) {
  const reduce = useReducedMotion();
  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 0);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  }

  function scrollByCards(dir) {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("article");
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const w = firstCard ? firstCard.getBoundingClientRect().width : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * (w + gap), behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    const onScroll = () => updateEdges();
    const onResize = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
        className="mx-auto max-w-screen-xl"
      >
        <div className="relative">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollByCards(-1)}
            disabled={atStart}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full border border-neutral-200/60 bg-white/80 backdrop-blur shadow-sm flex items-center justify-center transition ${atStart ? "opacity-40 cursor-not-allowed" : "hover:bg-white"}`}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-neutral-800" />
          </button>

          <div
            ref={scrollerRef}
            className="
              flex flex-nowrap overflow-x-auto overflow-y-hidden
              gap-6 md:gap-8 scroll-smooth snap-x snap-mandatory
              [-ms-overflow-style:none] [scrollbar-width:none]
            "
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>

            {items.map((c, i) => (
              <motion.article
                key={i}
                variants={item}
                className="
                  snap-start shrink-0
                  basis-full
                  sm:basis-[calc((100%-24px)/2)]
                  md:basis-[calc((100%-32px)/2)]
                  lg:basis-[calc((100%-96px)/4)]
                  group relative overflow-hidden rounded-2xl bg-white
                  ring-1 ring-black/5 shadow-sm transition
                  will-change-transform transform-gpu
                  hover:shadow-lg focus-within:shadow-lg
                "
              >
                <CategoryCardLink href={c.href} title={c.title} image={c.image} />
              </motion.article>
            ))}
          </div>

          <button
            type="button"
            aria-label="Próximo"
            onClick={() => scrollByCards(1)}
            disabled={atEnd}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full border border-neutral-200/60 bg-white/80 backdrop-blur shadow-sm flex items-center justify-center transition ${atEnd ? "opacity-40 cursor-not-allowed" : "hover:bg-white"}`}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-neutral-800" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

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
      <div className="relative overflow-hidden">
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
      </div>

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
