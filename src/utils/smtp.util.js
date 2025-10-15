import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carga y reemplaza variables dentro de una plantilla HTML
 * @param {string} templateName - Nombre de la plantilla sin extensión
 * @param {Object} params - Claves y valores para reemplazar en la plantilla
 * @returns {Promise<string>} - Contenido HTML procesado
 */
export async function loadTemplate(templateName, params = {}) {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  try {
    let templateContent = await fs.readFile(templatePath, 'utf8');

    // Reemplaza {{clave}} en la plantilla por el valor correspondiente
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      templateContent = templateContent.replace(regex, value);
    }

    return templateContent;
  } catch (err) {
    throw new Error(`Error al cargar la plantilla: ${err.message}`);
  }
}

/**
 * Envía un correo usando SMTP y una plantilla
 * @param {Object} options - Opciones para el envío
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.templateName - Nombre de la plantilla HTML
 * @param {Object} options.params - Parámetros para insertar en la plantilla
 */
export async function sendEmail({ to, subject, templateName, params = {} }) {
  const htmlContent = await loadTemplate(templateName, params);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"No Reply" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}
