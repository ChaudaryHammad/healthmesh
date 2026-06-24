"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { createTrialSubscription, ensureTrialSubscription } from "@/lib/subscription";
import type { ContactMessageStatus, PlanTier, Role, SubscriptionStatus } from "@prisma/client";

const ADMIN_PATHS = [
  "/admin",
  "/admin/users",
  "/admin/websites",
  "/admin/billing",
  "/admin/newsletter",
  "/admin/contacts",
] as const;

function revalidateAdmin() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
}

async function requireAdminAction() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized." };
  }
  return { ok: true as const, adminId: session.user.id };
}

const subscriptionUpdateSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["STARTER", "PRO", "AGENCY"]).nullable(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"]),
  trialEndsAt: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  adminNotes: z.string().nullable(),
});

function parseOptionalDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function updateUserRoleAction(userId: string, role: Role) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  if (auth.adminId === userId && role !== "ADMIN") {
    return { success: false, error: "You cannot remove your own admin role." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.adminId,
        action: "ADMIN_USER_ROLE_UPDATED",
        description: `Changed role for ${user.email} to ${role}`,
        metadata: { targetUserId: userId, role },
      },
    });

    revalidateAdmin();
    return { success: true, message: `Role updated to ${role}.` };
  } catch (error) {
    console.error("updateUserRoleAction:", error);
    return { success: false, error: "Failed to update role." };
  }
}

export async function setUserBannedAction(userId: string, banned: boolean) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  if (auth.adminId === userId) {
    return { success: false, error: "You cannot ban your own account." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: banned ? new Date() : null },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.adminId,
        action: banned ? "ADMIN_USER_BANNED" : "ADMIN_USER_RESTORED",
        description: `${banned ? "Banned" : "Restored"} user ${user.email}`,
        metadata: { targetUserId: userId },
      },
    });

    revalidateAdmin();
    return {
      success: true,
      message: banned ? "User banned (soft-deleted)." : "User restored.",
    };
  } catch (error) {
    console.error("setUserBannedAction:", error);
    return { success: false, error: "Failed to update user status." };
  }
}

export async function verifyUserEmailAction(userId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: user.emailVerified ?? new Date() },
    });

    revalidateAdmin();
    return { success: true, message: "Email marked as verified." };
  } catch (error) {
    console.error("verifyUserEmailAction:", error);
    return { success: false, error: "Failed to verify email." };
  }
}

export async function setWebsiteDisabledAction(websiteId: string, disabled: boolean) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: { user: { select: { email: true } } },
    });
    if (!website) return { success: false, error: "Website not found." };

    await prisma.website.update({
      where: { id: websiteId },
      data: { deletedAt: disabled ? new Date() : null },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.adminId,
        action: disabled ? "ADMIN_WEBSITE_DISABLED" : "ADMIN_WEBSITE_ENABLED",
        description: `${disabled ? "Disabled" : "Enabled"} website ${website.name} (${website.user.email})`,
        metadata: { websiteId },
      },
    });

    revalidateAdmin();
    return {
      success: true,
      message: disabled ? "Website disabled." : "Website re-enabled.",
    };
  } catch (error) {
    console.error("setWebsiteDisabledAction:", error);
    return { success: false, error: "Failed to update website." };
  }
}

export async function adminForceScanAction(websiteId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const website = await prisma.website.findFirst({
      where: { id: websiteId, deletedAt: null },
    });
    if (!website) return { success: false, error: "Website not found or disabled." };

    const running = await prisma.scan.findFirst({
      where: { websiteId, status: "RUNNING" },
    });
    if (running) {
      return {
        success: false,
        error: "A scan is already running for this website.",
        data: { scanId: running.id },
      };
    }

    const scan = await prisma.scan.create({
      data: {
        websiteId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.adminId,
        action: "ADMIN_FORCE_SCAN",
        description: `Admin triggered audit for ${website.name}`,
        metadata: { websiteId, scanId: scan.id },
      },
    });

    revalidateAdmin();
    return { success: true, data: { scanId: scan.id }, message: "Audit scan started." };
  } catch (error) {
    console.error("adminForceScanAction:", error);
    return { success: false, error: "Failed to start scan." };
  }
}

export async function updateSubscriptionAction(input: unknown) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = subscriptionUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid subscription data." };
  }

  const data = parsed.data;

  try {
    const user = await prisma.user.findFirst({
      where: { id: data.userId, deletedAt: null },
    });
    if (!user) return { success: false, error: "User not found." };

    await prisma.subscription.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        plan: data.plan as PlanTier | null,
        status: data.status as SubscriptionStatus,
        trialEndsAt: parseOptionalDate(data.trialEndsAt),
        currentPeriodEnd: parseOptionalDate(data.currentPeriodEnd),
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        adminNotes: data.adminNotes,
      },
      update: {
        plan: data.plan as PlanTier | null,
        status: data.status as SubscriptionStatus,
        trialEndsAt: parseOptionalDate(data.trialEndsAt),
        currentPeriodEnd: parseOptionalDate(data.currentPeriodEnd),
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        adminNotes: data.adminNotes,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.adminId,
        action: "ADMIN_SUBSCRIPTION_OVERRIDE",
        description: `Manual subscription override for ${user.email}`,
        metadata: {
          targetUserId: data.userId,
          plan: data.plan,
          status: data.status,
        },
      },
    });

    revalidateAdmin();
    return { success: true, message: "Subscription updated." };
  } catch (error) {
    console.error("updateSubscriptionAction:", error);
    return { success: false, error: "Failed to update subscription." };
  }
}

export async function initMissingSubscriptionsAction() {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null, subscription: null },
      select: { id: true },
    });

    for (const user of users) {
      await createTrialSubscription(user.id);
    }

    revalidateAdmin();
    return {
      success: true,
      message: `Created ${users.length} trial subscription record${users.length === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    console.error("initMissingSubscriptionsAction:", error);
    return { success: false, error: "Failed to initialize subscriptions." };
  }
}

export async function initUserSubscriptionAction(userId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await ensureTrialSubscription(userId);
    revalidateAdmin();
    return { success: true, message: "Trial subscription created." };
  } catch (error) {
    console.error("initUserSubscriptionAction:", error);
    return { success: false, error: "Failed to create subscription." };
  }
}

export async function updateContactStatusAction(
  messageId: string,
  status: ContactMessageStatus
) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status,
        readAt: status === "NEW" ? null : new Date(),
      },
    });

    revalidateAdmin();
    return { success: true, message: "Message updated." };
  } catch (error) {
    console.error("updateContactStatusAction:", error);
    return { success: false, error: "Failed to update message." };
  }
}

export async function exportNewsletterCsvAction() {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false, error: auth.error };

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: "desc" },
  });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = subscribers.map((sub) =>
    [sub.email, sub.subscribedAt.toISOString()].map(escape).join(",")
  );

  return {
    success: true,
    data: {
      csv: ["Email,Subscribed At", ...rows].join("\n"),
      filename: `loopnode-newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
    },
  };
}
