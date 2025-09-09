import sendEmail from "../utils/sendEmail.js";
import path from "path";
import fs from "fs";

export const contactForm = async (req, res) => {
  try {
    const { name, email, subject, orderId, message } = req.body;
    let attachment = [];

    // se veio arquivo
    if (req.file) {
      attachment.push({
        filename: req.file.originalname,
        content: fs.createReadStream(req.file.path),
      });
    }

    await sendEmail({
      to: process.env.CONTACT_EMAIL, // coloque no .env o email destino
      subject: `📩 Novo contato: ${subject || "Sem assunto"}`,
      html: `
        <h2>Novo contato pelo site</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Pedido:</strong> ${orderId || "N/A"}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
      attachments: attachment,
    });

    res.status(200).json({ success: true, message: "Mensagem enviada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao enviar mensagem" });
  }
};
