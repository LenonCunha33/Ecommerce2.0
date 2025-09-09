import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const [statusMsg, setStatusMsg] = useState("Verificando pagamento…");
  const onceRef = useRef(false); // evita duplo disparo

  const successParam = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  // aceita "true", "1", "yes" (string) como sucesso
  const isSuccess =
    String(successParam).toLowerCase() === "true" ||
    String(successParam) === "1" ||
    String(successParam).toLowerCase() === "yes";

  // tenta os endpoints em sequência (novo -> antigo)
  const tryVerifyEndpoints = async (payload, config) => {
    const endpoints = [
      "/api/order/verifyStripe",
      "/api/order/verify-stripe",     // se você registrar com hífen
      "/api/order/verifyStrpePayment" // endpoint antigo com typo
    ];
    for (const ep of endpoints) {
      try {
        const res = await axios.post(`${backendUrl}${ep}`, payload, config);
        return res;
      } catch (err) {
        // se for 404/405/Not Found, tenta o próximo
        const code = err?.response?.status;
        if (code && code !== 404 && code !== 405) throw err;
        // continua tentando os próximos
      }
    }
    // se todos falharem, lança o último erro simulando 404
    const error = new Error("Nenhum endpoint de verificação encontrado");
    error.code = 404;
    throw error;
  };

  useEffect(() => {
    // Proteções básicas
    if (onceRef.current) return;
    if (!orderId) {
      toast.error("Pedido inválido: orderId ausente.");
      navigate("/carrinho", { replace: true });
      return;
    }
    if (!token) {
      // a /verify normalmente é protegida, mas garantimos aqui também
      toast.info("Faça login para concluir a verificação.");
      navigate("/login", { replace: true });
      return;
    }

    onceRef.current = true;

    (async () => {
      try {
        setStatusMsg("Confirmando com o servidor…");

        // mesmo com webhook ativo, esse passo ajuda a:
        // - limpar carrinho no cliente
        // - marcar status se o usuário voltar da página do Stripe sem o webhook ter chegado ainda
        const payload = { success: String(isSuccess), orderId };
        const config = { headers: { token } };

        const res = await tryVerifyEndpoints(payload, config);
        const ok = !!res?.data?.success;

        if (isSuccess && ok) {
          // pagamento OK
          setCartItems({});
          toast.success("Pagamento confirmado! 👍");
          navigate("/pedidos", { replace: true });
        } else if (!isSuccess) {
          // cancelado/fracassado
          toast.error(res?.data?.message || "Pagamento não concluído.");
          navigate("/carrinho", { replace: true });
        } else {
          // sucesso no query param, mas backend disse não
          toast.warn(res?.data?.message || "Não foi possível confirmar o pagamento agora.");
          navigate("/pedidos", { replace: true });
        }
      } catch (error) {
        console.error("[Verify] erro:", error);
        // fallback pelo query param mesmo
        if (isSuccess) {
          setCartItems({});
          toast.info("Pagamento confirmado (fallback).");
          navigate("/pedidos", { replace: true });
        } else {
          toast.error("Pagamento não concluído.");
          navigate("/carrinho", { replace: true });
        }
      }
    })();
  }, [token, orderId, isSuccess, backendUrl, navigate, setCartItems]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* spinner simples */}
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <p className="text-gray-600">{statusMsg}</p>
      </div>
    </div>
  );
};

export default Verify;
