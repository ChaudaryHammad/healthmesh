import { sendViaSmtp, type SendEmailOptions } from "./send-smtp";

export type { SendEmailOptions } from "./send-smtp";

export class EmailSendError extends Error {
  constructor(
    message: string,
    public readonly hint?: string
  ) {
    super(message);
    this.name = "EmailSendError";
  }
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    await sendViaSmtp(options);
  } catch (error) {
    console.error("[email] SMTP send failed:", error);

    const message = error instanceof Error ? error.message : "Failed to send email.";
    throw new EmailSendError(
      message,
      "Check SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local (use a Google App Password for Gmail)."
    );
  }
}
