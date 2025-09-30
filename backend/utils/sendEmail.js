// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

/* =============================================================================
 * Transporter SMTP (reaproveitado)
 * ========================================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =============================================================================
 * Envio genérico
 * ========================================================================== */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
  replyTo,
}) => {
  const recipient = to || process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  if (!recipient) throw new Error("Destinatário (to) não definido");

  await transporter.sendMail({
    from: `"Marima" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    text,
    html,
    attachments,
    replyTo,
  });
};

/* =============================================================================
 * Estilos / template base
 * ========================================================================== */
const COLORS = {
  bgFallback: "#f2f2f2",
  bgBrand: "#f2f2f2f2",
  text: "#1f2937",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  accent: "#111111",
  link: "#111111",
};

const WRAPPER_STYLE = `
  margin:0; padding:0; width:100%;
  background-color:${COLORS.bgFallback};
  background-color:${COLORS.bgBrand};
`;
const CONTAINER_STYLE = `
  font-family: Arial, Helvetica, sans-serif;
  color:${COLORS.text};
  max-width:600px; margin:0 auto; padding:0 16px;
`;
const CARD_STYLE = `
  background:#ffffff;
  border:1px solid ${COLORS.border};
  border-radius:12px;
  padding:24px;
`;
const H1_STYLE = `
  margin:0 0 8px 0;
  font-size:20px; line-height:28px;
  color:${COLORS.accent};
`;
const LEAD_STYLE = `
  margin:0 0 16px 0;
  font-size:14px; line-height:22px;
  color:${COLORS.text};
`;
const HR_STYLE = `height:1px; border:none; background:${COLORS.border}; margin:16px 0;`;
const CTA_BUTTON_STYLE = `
  display:inline-block; padding:12px 18px; background:${COLORS.accent};
  color:#ffffff !important; text-decoration:none; border-radius:8px;
  font-weight:600; font-size:14px; line-height:20px;
`;
const FOOTER_STYLE = `
  margin:16px 0 32px 0;
  font-size:12px; line-height:18px; color:${COLORS.textMuted};
`;

const stripHtml = (str = "") => String(str).replace(/<[^>]*>/g, "");

/** Template base com preheader, título, conteúdo e CTA opcional */
function baseTemplate({ preheader = "", title, contentHtml, cta }) {
  const CTA_BLOCK =
    cta?.url && cta?.label
      ? `<div style="margin-top:16px;"><a href="${cta.url}" target="_blank" style="${CTA_BUTTON_STYLE}">${cta.label}</a></div>`
      : "";

  const PREHEADER_HIDDEN = `
    <div style="display:none;overflow:hidden;line-height:1;font-size:1px;color:#ffffff;opacity:0;max-height:0;max-width:0;">
      ${preheader}
    </div>
  `;

  return `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${stripHtml(title || "Marima")}</title>
      <style>
        a { color: ${COLORS.link}; }
        @media (max-width: 620px) {
          .container { padding: 0 12px !important; }
          .card { padding: 20px !important; }
        }
        img { max-width:100%; height:auto; border-radius:10px; }
      </style>
    </head>
    <body style="${WRAPPER_STYLE}">
      ${PREHEADER_HIDDEN}
      <div class="container" style="${CONTAINER_STYLE}">
        <div style="height:20px;"></div>
        <div class="card" style="${CARD_STYLE}">
          <h1 style="${H1_STYLE}">${title}</h1>
          <hr style="${HR_STYLE}" />
          <div style="${LEAD_STYLE}">
            ${contentHtml}
          </div>
          ${CTA_BLOCK}
        </div>
        <div style="${FOOTER_STYLE}">
          <p>A <strong>Marima</strong> oferece curadoria de produtos com experiência de compra clara, segura e transparente.</p>
          <p>Suporte: ${process.env.SMTP_USER || ""}${
            process.env.FRONTEND_URL
              ? ` · Site: <a href="${process.env.FRONTEND_URL}" target="_blank" style="color:${COLORS.link}; text-decoration:none;">${process.env.FRONTEND_URL}</a>`
              : ""
          }</p>
          <p>&copy; ${new Date().getFullYear()} Marima. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

/* =============================================================================
 * E-mails ativos
 * 1) Boas-vindas (login/criação de conta)
 * 2) Abandono de carrinho (checkout Yampi não concluído)
 * ========================================================================== */

export async function sendWelcomeEmail({
  userEmail,
  userName,
  couponCode,
  appUrl,
}) {
  const safeName = userName || userEmail;
  const code = couponCode || process.env.COUPON10 || "USERTEM10";
  const ctaUrl =
    appUrl || process.env.FRONTEND_URL || process.env.APP_URL || "#";

  const preheader = `Conta criada com sucesso. Seu cupom: ${code}`;
  const title = "Conta criada com sucesso";
  const content = `
    <p style="margin:0 0 12px 0;">Olá ${safeName},</p>
    <p style="margin:0 0 12px 0;">Sua conta foi criada com sucesso. Para dar as boas-vindas, disponibilizamos um cupom exclusivo para sua primeira compra:</p>
    <div style="margin:16px 0; padding:14px 16px; border:2px dashed ${COLORS.accent}; border-radius:10px; text-align:center; font-size:18px; font-weight:700; letter-spacing:1px; color:${COLORS.accent};">
      ${code}
    </div>
    <p style="margin:0 0 12px 0;">Aplique esse código no carrinho ou no checkout para obter o desconto. Caso tenha dúvidas, basta responder este e-mail.</p>
  `;

  const html = baseTemplate({
    preheader,
    title,
    contentHtml: content,
    cta: { label: "Ir para a loja", url: ctaUrl },
  });

  await sendEmail({
    to: userEmail,
    subject: `Conta criada com sucesso — seu cupom ${code}`,
    html,
    text: `Bem-vindo(a). Seu cupom é: ${code}. Acesse: ${ctaUrl}`,
  });
}

export async function sendAbandonedCartEmail({
  userEmail,
  userName,
  productName,
  productImage,
  size,
  checkoutUrl,
}) {
  if (!userEmail || !checkoutUrl) return;

  const safeName = userName || "Cliente";
  const preheader = `Seu pedido está te esperando — finalize antes que acabe!`;
  const title = "Volte! Seu pedido está te esperando";
  const content = `
    <p style="margin:0 0 12px 0;">Olá ${safeName},</p>
    <p style="margin:0 0 12px 0;">
      Notamos que você iniciou a compra e não concluiu o pagamento.
      <strong>Volte agora — estamos com seu pedido aqui</strong> e as unidades são limitadas.
    </p>
    ${
      productImage
        ? `<div style="margin:12px 0;"><img src="${productImage}" alt="${(productName || "Produto")
            .replace(/<[^>]*>/g, "")}" /></div>`
        : ""
    }
    <p style="margin:0 0 6px 0;"><strong>${(productName || "Produto")
      .replace(/<[^>]*>/g, "")}</strong>${size ? ` • Tamanho ${String(size).replace(/<[^>]*>/g, "")}` : ""}</p>
    <p style="margin:0;">Garanta o seu antes que acabe o estoque.</p>
  `;

  const html = baseTemplate({
    preheader,
    title,
    contentHtml: content,
    cta: { label: "Finalizar compra agora", url: checkoutUrl },
  });

  await sendEmail({
    to: userEmail,
    subject: "Volte! Seu pedido está te esperando",
    html,
    text: `${safeName}, finalize sua compra: ${checkoutUrl}`,
  });
}

/* default export (útil se você fazia import default) */
export default sendEmail;
