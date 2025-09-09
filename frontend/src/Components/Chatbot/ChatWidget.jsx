// src/Components/Chatbot/ChatWidget.jsx
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X, ChevronRight, RotateCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// animações
const panelVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 240 } },
  exit:   { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }
};
const optionVariants = {
  hidden: { opacity: 0, x: 8 },
  show:   (i) => ({ opacity: 1, x: 0, transition: { delay: 0.03 * i, duration: 0.18 } })
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const reduce = useReducedMotion();
  const firstBtnRef = useRef(null);

  // carrega o fluxo só quando abre
  useEffect(() => {
    if (!open || flow) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const url = `${String(API_BASE || "").replace(/\/+$/, "")}/api/chat/flow`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setFlow(json);
        setCurrentId(json.entry);
      } catch (e) {
        console.error("[ChatWidget] erro:", e);
        setErr("Não foi possível carregar o chat.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, flow]);

  const currentNode = flow?.nodes?.[currentId] ?? null;

  const runAction = (action) => {
    if (!action) return;
    if (action.type === "open_url") window.open(action.url, "_blank", "noopener,noreferrer");
    if (action.type === "navigate") window.location.href = action.to;
  };
  const choose = (opt) => {
    if (opt.action) runAction(opt.action);
    if (opt.next) setCurrentId(opt.next);
  };
  const reset = () => setCurrentId(flow?.entry ?? "start");

  // acessibilidade: foca no 1º botão quando nós mudarem
  useEffect(() => {
    if (currentNode && firstBtnRef.current) {
      const t = setTimeout(() => firstBtnRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [currentNode]);

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        className="
          fixed z-[9999]
          bottom-6 right-6 md:bottom-8 md:right-8
          h-16 w-16 rounded-full
          bg-gradient-to-br from-black via-neutral-900 to-neutral-800
          text-white shadow-[0_10px_30px_rgba(0,0,0,.25)]
          ring-2 ring-white/5 hover:ring-white/15
          flex items-center justify-center
        "
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              <X className="h-7 w-7" aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: -15, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 15, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="relative flex"
            >
              <MessageCircle className="h-8 w-8" aria-hidden />
              {/* glow */}
              <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 blur-[8px]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Janela do chat */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="
              fixed z-[9998]
              bottom-24 right-6 md:bottom-28 md:right-8
              w-[22rem] md:w-[24rem] max-w-[92vw]
              rounded-2xl overflow-hidden
              border border-neutral-900/10 bg-white shadow-2xl
              backdrop-blur-xl
            "
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-black via-neutral-900 to-neutral-800 text-white">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/15">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Atendimento</h3>
                  <p className="text-[11px] text-white/70">Escolha uma opção para continuar</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Fechar"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[22rem] overflow-auto p-3 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin" />
                  Carregando…
                </div>
              )}

              {!loading && err && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {err} <br />
                  Verifique <code>VITE_BACKEND_URL</code> e <code>/api/chat/flow</code>.
                </div>
              )}

              {!loading && !err && currentNode && (
                <>
                  {/* bolha da "mensagem" do bot */}
                  <div className="flex gap-2">
                    <div className="mt-1 h-6 w-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-neutral-100 text-neutral-900 px-3 py-2 text-sm leading-relaxed shadow-sm">
                      {currentNode.message}
                    </div>
                  </div>

                  {/* opções */}
                  <div className="grid gap-2">
                    {currentNode.options?.map((opt, i) => (
                      <motion.button
                        key={i}
                        custom={i}
                        variants={optionVariants}
                        initial="hidden"
                        animate="show"
                        whileHover={reduce ? undefined : { y: -1 }}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        onClick={() => choose(opt)}
                        ref={i === 0 ? firstBtnRef : undefined}
                        className="
                          group w-full text-left
                          px-3 py-2 rounded-xl
                          bg-white border border-neutral-200
                          hover:bg-neutral-50 hover:border-neutral-300
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300
                          transition
                          flex items-center justify-between gap-3
                          text-sm
                        "
                      >
                        <span className="truncate">{opt.label}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition" />
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-neutral-50/60">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-black px-2 py-1 rounded-md hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                title="Recomeçar"
              >
                <RotateCcw className="h-4 w-4" />
                Recomeçar
              </button>
              <span className="text-[11px] text-neutral-500">Suporte por opções</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
