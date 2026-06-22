"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send-email";
import { getAppUrl } from "@/lib/email/config";
import {
  renderNewsletterWelcomeEmail,
  renderNewsletterUnsubscribeEmail,
} from "@/lib/email/templates";
import {
  parseNewsletterUnsubscribeToken,
  newsletterUnsubscribeUrl,
} from "@/lib/email/tokens";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

async function sendWelcomeEmail(email: string) {
  const unsubscribeUrl = newsletterUnsubscribeUrl(email, getAppUrl());
  const { subject, html } = renderNewsletterWelcomeEmail({ unsubscribeUrl });
  await sendEmail({ to: email, subject, html });
}

export async function subscribeToNewsletter(email: string) {
  const parsed = subscribeSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.unsubscribedAt === null) {
        return { success: true, message: "You are already subscribed!" };
      }

      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { unsubscribedAt: null, subscribedAt: new Date() },
      });

      await sendWelcomeEmail(normalizedEmail);

      return { success: true, message: "Welcome back! Check your inbox to confirm your subscription." };
    }

    await prisma.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    });

    await sendWelcomeEmail(normalizedEmail);

    return { success: true, message: "Thank you for subscribing! Check your inbox for a confirmation email." };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}

export async function unsubscribeFromNewsletter(token: string) {
  const email = parseNewsletterUnsubscribeToken(token);
  if (!email) {
    return { success: false, error: "This unsubscribe link is invalid or has expired." };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { email },
    });

    if (!subscriber || subscriber.unsubscribedAt !== null) {
      return { success: true, message: "You are already unsubscribed from our newsletter." };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
    });

    const { subject, html } = renderNewsletterUnsubscribeEmail();
    await sendEmail({ to: email, subject, html });

    return { success: true, message: "You have been unsubscribed. We're sorry to see you go!" };
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}
