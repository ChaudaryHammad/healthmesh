import nodemailer from "nodemailer";
import { getEmailFrom, getSmtpConfig } from "./config";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const { host, port, user, pass } = getSmtpConfig();
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendViaSmtp(options: SendEmailOptions) {
  const transport = getTransporter();
  const to = Array.isArray(options.to) ? options.to : [options.to];

  await transport.sendMail({
    from: getEmailFrom(),
    to: to.join(", "),
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });
}
