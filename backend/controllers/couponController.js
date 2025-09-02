// backend/controllers/couponController.js
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    // Cupons definidos no .env
    const coupons = {
      [process.env.COUPON10]: 10, // 10 reais de desconto
      [process.env.COUPON20]: 20, // 20 reais de desconto
    };

    if (coupons[code]) {
      return res.status(200).json({
        success: true,
        discount: coupons[code],
        message: "Cupom aplicado com sucesso!",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cupom inválido ou expirado",
    });
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};
