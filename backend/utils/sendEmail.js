import nodemailer from "nodemailer";

/** Transporter único (reaproveitado) */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/** Função genérica de envio */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
  replyTo
}) => {
  // fallback do destinatário
  const recipient = to || process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  if (!recipient) throw new Error("Destinatário (to) não definido");

  await transporter.sendMail({
    from: `"Suporte" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    text,
    html,
    attachments,
    replyTo
  });
};

/* =====================================================================================
 * ESTILOS E LAYOUT BASE (UI/UX)
 * - Largura 600px, responsivo (max-width)
 * - Fundo solicitado: #f2f2f2f2 (com fallback #f2f2f2 para compatibilidade)
 * - Texto principal gray-800 (#1f2937)
 * - Sem emojis
 * ===================================================================================== */

const COLORS = {
  bgFallback: "#f2f2f2",
  bgBrand: "#f2f2f2f2", // pode não ser suportado em todos os clientes, por isso mantemos fallback
  text: "#1f2937",      // gray-800
  textMuted: "#6b7280", // gray-500
  border: "#e5e7eb",    // gray-200
  accent: "#111111",    // botões e títulos
  link: "#111111"
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

const MUTED_STYLE = `
  margin:0;
  font-size:12px; line-height:18px;
  color:${COLORS.textMuted};
`;

const HR_STYLE = `
  height:1px; border:none; background:${COLORS.border};
  margin:16px 0;
`;

const TABLE_STYLE = `
  width:100%; border-collapse:collapse; margin-top:8px;
`;

const TH_TD_BASE = `
  padding:8px 0; border-bottom:1px solid ${COLORS.border};
  font-size:14px; line-height:22px; color:${COLORS.text};
`;

const CTA_BUTTON_STYLE = `
  display:inline-block;
  padding:12px 18px;
  background:${COLORS.accent};
  color:#ffffff !important;
  text-decoration:none;
  border-radius:8px;
  font-weight:600;
  font-size:14px;
  line-height:20px;
`;

const FOOTER_STYLE = `
  margin:16px 0 32px 0;
  font-size:12px; line-height:18px; color:${COLORS.textMuted};
`;

/**
 * Template base com preheader (preview), título e conteúdo
 * - contentHtml: conteúdo específico de cada e-mail
 * - cta: { label, url } (opcional)
 */
function baseTemplate({ preheader = "", title, contentHtml, cta }) {
  const CTA_BLOCK = cta?.url && cta?.label
    ? `
      <div style="margin-top:16px;">
        <a href="${cta.url}" target="_blank" style="${CTA_BUTTON_STYLE}">${cta.label}</a>
      </div>
    `
    : "";

  // preheader oculto
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
      <title>${stripHtml(title || "Mensagem")}</title>
      <style>
        /* Gerenciamento básico de links */
        a { color: ${COLORS.link}; }
        @media (max-width: 620px) {
          .container { padding: 0 12px !important; }
          .card { padding: 20px !important; }
        }
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
          <p style="${MUTED_STYLE}">
            A <strong>Marima</strong> oferece produtos selecionados com curadoria e um atendimento próximo,
            priorizando uma experiência de compra clara, segura e transparente.
          </p>
          <p style="${MUTED_STYLE}">
            Suporte: ${process.env.SMTP_USER || ""}${
              process.env.FRONTEND_URL ? ` · Site: <a href="${process.env.FRONTEND_URL}" target="_blank" style="color:${COLORS.link}; text-decoration:none;">${process.env.FRONTEND_URL}</a>` : ""
            }
          </p>
          <p style="${MUTED_STYLE}">&copy; ${new Date().getFullYear()} Marima. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

function stripHtml(str = "") {
  return String(str).replace(/<[^>]*>/g, "");
}

/* =====================================================================================
 * TEMPLATES DE PEDIDO POR STATUS
 * - Textos reescritos em tom profissional
 * - Sem emojis
 * - Se houver código de rastreio/transportadora, mostramos de forma clara
 * ===================================================================================== */

function orderItemsTable(items = []) {
  const rows = items.map(i => {
    const title = i.title || i.name || "Item";
    const qty = Number(i.quantity || i.qty || 1);
    const unit = Number(i.price || 0);
    const total = (qty * unit).toFixed(2);
    return `
      <tr>
        <td style="${TH_TD_BASE}">${title} × ${qty}</td>
        <td style="${TH_TD_BASE}; text-align:right;">R$ ${total}</td>
      </tr>
    `;
  }).join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="${TABLE_STYLE}">
      <tbody>
        ${rows}
        <tr>
          <td style="${TH_TD_BASE}; font-weight:600;">Total</td>
          <td style="${TH_TD_BASE}; text-align:right; font-weight:600;">R$ <!--TOTAL--></td>
        </tr>
      </tbody>
    </table>
  `;
}

function templateForStatus(status, ctx) {
  const {
    orderId,
    items = [],
    total,
    userName,
    trackingCode,
    carrier
  } = ctx;

  const itemsTable = orderItemsTable(items).replace("<!--TOTAL-->", Number(total || 0).toFixed(2));

  const trackingBlock = trackingCode
    ? `
      <div style="margin-top:12px;">
        <div style="font-size:13px; line-height:20px; color:${COLORS.text};"><strong>Código de rastreio:</strong> ${trackingCode}</div>
        ${carrier ? `<div style="font-size:13px; line-height:20px; color:${COLORS.text};"><strong>Transportadora:</strong> ${carrier}</div>` : ""}
      </div>
    `
    : "";

  const greetings = userName ? `Olá ${userName},` : `Olá,`;

  const templates = {
    "Pedido Realizado": {
      subject: `Pedido #${orderId} confirmado`,
      title: "Pedido confirmado",
      preheader: `Recebemos o seu pedido #${orderId}.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">Recebemos o seu pedido <strong>#${orderId}</strong>. Em breve você receberá novas atualizações sobre a preparação e o envio.</p>
        <p style="margin:0 0 12px 0;">Abaixo está um resumo do seu pedido:</p>
        ${itemsTable}
        <p style="margin:16px 0 0 0; ${MUTED_STYLE}">Guarde este e-mail para referência futura.</p>
      `,
      cta: null
    },
    "Embalando": {
      subject: `Pedido #${orderId} em preparação`,
      title: "Estamos preparando o seu pedido",
      preheader: `O pedido #${orderId} entrou em preparação.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">Seu pedido <strong>#${orderId}</strong> está em preparação. Nossa equipe está separando e embalando os itens com cuidado.</p>
        <p style="margin:0 0 12px 0;">Resumo do pedido:</p>
        ${itemsTable}
      `,
      cta: null
    },
    "Enviado": {
      subject: `Pedido #${orderId} enviado`,
      title: "Seu pedido foi enviado",
      preheader: `O pedido #${orderId} foi despachado ${trackingCode ? "com código de rastreio" : ""}.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">O seu pedido <strong>#${orderId}</strong> foi despachado e segue para o endereço informado.</p>
        ${trackingBlock}
        <p style="margin:12px 0;">Resumo do pedido:</p>
        ${itemsTable}
      `,
      cta: trackingCode ? { label: "Acompanhar entrega", url: "#" } : null // se tiver URL real de rastreio, substitua aqui
    },
    "Saiu Para Entrega": {
      subject: `Pedido #${orderId} saiu para entrega`,
      title: "Pedido a caminho",
      preheader: `O pedido #${orderId} está com o entregador.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">
          O seu pedido <strong>#${orderId}</strong> saiu para entrega e deve chegar em breve.
          Você poderá receber uma mensagem via WhatsApp ou uma ligação do nosso entregador parceiro para combinar a entrega, se necessário.
        </p>
        ${trackingBlock}
        <p style="margin:12px 0;">Resumo do pedido:</p>
        ${itemsTable}
      `,
      cta: trackingCode ? { label: "Acompanhar entrega", url: "#" } : null
    },
    "Entregue": {
      subject: `Pedido #${orderId} entregue`,
      title: "Pedido entregue",
      preheader: `Confirmamos a entrega do pedido #${orderId}.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">Confirmamos a entrega do seu pedido <strong>#${orderId}</strong>. Esperamos que a experiência tenha sido positiva.</p>
        <p style="margin:12px 0;">Resumo do pedido:</p>
        ${itemsTable}
        <p style="margin:16px 0 0 0; ${MUTED_STYLE}">Se houver qualquer divergência, responda este e-mail e nossa equipe irá ajudar.</p>
      `,
      cta: null
    },
    "Finalizado": {
      subject: `Pedido #${orderId} finalizado`,
      title: "Pedido finalizado",
      preheader: `O pedido #${orderId} foi concluído em nosso sistema.`,
      content: `
        <p style="margin:0 0 12px 0;">${greetings}</p>
        <p style="margin:0 0 12px 0;">Concluímos o processamento do seu pedido <strong>#${orderId}</strong>. Agradecemos a sua compra.</p>
        <p style="margin:12px 0;">Resumo do pedido:</p>
        ${itemsTable}
      `,
      cta: { label: "Acessar a loja", url: process.env.FRONTEND_URL || process.env.APP_URL || "#" }
    }
  };

  const tpl = templates[status] || templates["Pedido Realizado"];
  const html = baseTemplate({
    preheader: tpl.preheader,
    title: tpl.title,
    contentHtml: tpl.content,
    cta: tpl.cta
  });

  return { subject: tpl.subject, html };
}

/**
 * Envio por status do pedido
 */
export async function sendOrderStatusEmail(status, ctx) {
  const { subject, html } = templateForStatus(status, ctx);
  await sendEmail({
    to: ctx.userEmail,
    subject,
    html,
    text: `${ctx.userName || "Cliente"} — Status do pedido #${ctx.orderId}: ${status}`
  });
}

/* =====================================================================================
 * E-MAIL DE BOAS-VINDAS COM CUPOM
 * - Tom profissional
 * - Sem emojis
 * - Mesmo layout/estilo do restante
 * ===================================================================================== */

export async function sendWelcomeEmail({ userEmail, userName, couponCode, appUrl }) {
  const safeName = userName || userEmail;
  const code = couponCode || process.env.COUPON10 || "USERTEM10";
  const ctaUrl = appUrl || process.env.FRONTEND_URL || process.env.APP_URL || "#";

  const preheader = `Conta criada com sucesso. Seu cupom: ${code}`;
  const title = "Conta criada com sucesso";
  const content = `
    <p style="margin:0 0 12px 0;">Olá ${safeName},</p>
    <p style="margin:0 0 12px 0;">Sua conta foi criada com sucesso. Para dar as boas-vindas, disponibilizamos um cupom exclusivo para sua primeira compra:</p>

    <div style="margin:16px 0; padding:14px 16px; border:2px dashed ${COLORS.accent}; border-radius:10px; text-align:center; font-size:18px; font-weight:700; letter-spacing:1px; color:${COLORS.accent};">
      ${code}
    </div>

    <p style="margin:0 0 12px 0;">Aplique esse código no carrinho ou no checkout para obter o desconto. Caso tenha dúvidas, basta responder este e-mail.</p>
  `; // <-- corrigido: fechamento com crase

  const html = baseTemplate({
    preheader,
    title,
    contentHtml: content,
    cta: { label: "Ir para a loja", url: ctaUrl }
  });

  await sendEmail({
    to: userEmail,
    subject: `Conta criada com sucesso — seu cupom ${code}`,
    html,
    text: `Bem-vindo(a). Seu cupom é: ${code}. Acesse: ${ctaUrl}`
  });
}

export default sendEmail;
