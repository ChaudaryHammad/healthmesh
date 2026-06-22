import {
  renderEmailLayout,
  emailButton,
  emailParagraph,
  emailMuted,
  emailCodeBlock,
  emailInfoBox,
  escapeHtml,
} from "./layout";

export function renderVerifyEmailEmail(params: { name: string; verifyUrl: string }) {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi there,";
  const body = `
    ${emailParagraph(`${greeting}`)}
    ${emailParagraph("Thanks for signing up for <strong style=\"color:#f9fafb;\">LoopNode</strong>. Please verify your email address to activate your account and start monitoring your websites.")}
    ${emailButton(params.verifyUrl, "Verify email address")}
    ${emailMuted("This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.")}
    ${emailCodeBlock(params.verifyUrl)}
  `;

  return {
    subject: "Verify your LoopNode email",
    html: renderEmailLayout({
      preheader: "Confirm your email to start using LoopNode",
      title: "Verify your email",
      body,
    }),
  };
}

export function renderPasswordResetEmail(params: { resetUrl: string }) {
  const body = `
    ${emailParagraph("We received a request to reset the password for your LoopNode account.")}
    ${emailParagraph("Click the button below to choose a new password. This link is valid for <strong style=\"color:#f9fafb;\">1 hour</strong>.")}
    ${emailButton(params.resetUrl, "Reset password")}
    ${emailMuted("If you didn't request a password reset, you can ignore this email — your password will stay the same.")}
    ${emailCodeBlock(params.resetUrl)}
  `;

  return {
    subject: "Reset your LoopNode password",
    html: renderEmailLayout({
      preheader: "Reset your LoopNode password",
      title: "Password reset request",
      body,
    }),
  };
}

export function renderPasswordResetSuccessEmail(params: { loginUrl: string }) {
  const body = `
    ${emailParagraph("Your LoopNode password was changed successfully.")}
    ${emailParagraph("If you made this change, no further action is needed. You can sign in with your new password.")}
    ${emailButton(params.loginUrl, "Sign in to LoopNode")}
    ${emailMuted("If you did <strong>not</strong> change your password, contact support immediately — your account may be compromised.")}
  `;

  return {
    subject: "Your LoopNode password was changed",
    html: renderEmailLayout({
      preheader: "Your password was updated successfully",
      title: "Password updated",
      body,
      footerNote: "Security notification from LoopNode.",
    }),
  };
}

export function renderContactSupportEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const body = `
    ${emailParagraph("A new message was submitted through the LoopNode contact form.")}
    ${emailInfoBox("Message details", [
      { label: "Name", value: params.name },
      { label: "Email", value: params.email },
      { label: "Subject", value: params.subject },
      { label: "Message", value: params.message },
    ])}
    ${emailMuted(`Reply directly to <a href="mailto:${escapeHtml(params.email)}" style="color:#a5b4fc;">${escapeHtml(params.email)}</a> to respond.`)}
  `;

  return {
    subject: `[Contact] ${params.subject}`,
    html: renderEmailLayout({
      preheader: `New contact form: ${params.subject}`,
      title: "New contact form submission",
      body,
      footerNote: "LoopNode contact form notification.",
    }),
  };
}

export function renderContactConfirmationEmail(params: { name: string }) {
  const body = `
    ${emailParagraph(`Hi ${escapeHtml(params.name)},`)}
    ${emailParagraph("Thanks for reaching out! We've received your message and our team will get back to you as soon as possible — usually within 1–2 business days.")}
    ${emailParagraph("In the meantime, you can explore LoopNode features or check our documentation for quick answers.")}
    ${emailMuted("This is an automated confirmation. Please don't reply to this email.")}
  `;

  return {
    subject: "We received your message — LoopNode",
    html: renderEmailLayout({
      preheader: "Thanks for contacting LoopNode",
      title: "Message received",
      body,
    }),
  };
}

export function renderNewsletterWelcomeEmail(params: {
  unsubscribeUrl: string;
}) {
  const body = `
    ${emailParagraph("Welcome to the <strong style=\"color:#f9fafb;\">LoopNode newsletter</strong>!")}
    ${emailParagraph("You'll receive occasional updates on website health monitoring, product improvements, SEO tips, and security best practices.")}
    ${emailParagraph("We're glad to have you on board.")}
    ${emailMuted(`<a href="${params.unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a> at any time if you no longer wish to receive these emails.`)}
  `;

  return {
    subject: "You're subscribed to LoopNode updates",
    html: renderEmailLayout({
      preheader: "Welcome to the LoopNode newsletter",
      title: "You're subscribed!",
      body,
      footerNote: "LoopNode newsletter. You can unsubscribe using the link above.",
    }),
  };
}

export function renderNewsletterUnsubscribeEmail() {
  const body = `
    ${emailParagraph("You've been unsubscribed from the LoopNode newsletter.")}
    ${emailParagraph("We're sorry to see you go. You won't receive any more marketing emails from us.")}
    ${emailMuted("Changed your mind? You can resubscribe anytime from our website footer.")}
  `;

  return {
    subject: "You've been unsubscribed — LoopNode",
    html: renderEmailLayout({
      preheader: "You've been unsubscribed from LoopNode emails",
      title: "Unsubscribed",
      body,
      footerNote: "LoopNode newsletter unsubscribe confirmation.",
    }),
  };
}
