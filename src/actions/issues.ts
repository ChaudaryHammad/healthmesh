"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertIssueOwnership,
  getPortfolioIssuesForUser,
} from "@/lib/issue-service";
import { revalidatePath } from "next/cache";

export type { PortfolioIssue } from "@/lib/issue-service";

export async function getPortfolioIssuesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized." };
  }

  try {
    const data = await getPortfolioIssuesForUser(session.user.id);
    return { success: true as const, data };
  } catch (error) {
    console.error("Get portfolio issues error:", error);
    return { success: false as const, error: "Failed to load issues." };
  }
}

export async function updateIssueStatusAction(
  issueId: string,
  status: "OPEN" | "ACKNOWLEDGED"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const issue = await assertIssueOwnership(issueId, session.user.id);
  if (!issue) {
    return { success: false, error: "Issue not found." };
  }

  if (issue.status === "RESOLVED") {
    return { success: false, error: "Resolved issues cannot be updated." };
  }

  try {
    await prisma.issue.update({
      where: { id: issueId },
      data: {
        status,
        acknowledgedAt: status === "ACKNOWLEDGED" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/issues");
    return {
      success: true,
      message: status === "ACKNOWLEDGED" ? "Issue acknowledged." : "Issue reopened.",
    };
  } catch (error) {
    console.error("Update issue status error:", error);
    return { success: false, error: "Failed to update issue." };
  }
}

export async function bulkUpdateIssueStatusAction(
  issueIds: string[],
  status: "OPEN" | "ACKNOWLEDGED"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  if (issueIds.length === 0) {
    return { success: false, error: "No issues selected." };
  }

  try {
    const owned = await prisma.issue.findMany({
      where: {
        id: { in: issueIds },
        status: { not: "RESOLVED" },
        scan: { website: { userId: session.user.id, deletedAt: null } },
      },
      select: { id: true },
    });

    const ownedIds = owned.map((i) => i.id);
    if (ownedIds.length === 0) {
      return { success: false, error: "No valid issues to update." };
    }

    await prisma.issue.updateMany({
      where: { id: { in: ownedIds } },
      data: {
        status,
        acknowledgedAt: status === "ACKNOWLEDGED" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/issues");
    return {
      success: true,
      message: `${ownedIds.length} issue${ownedIds.length === 1 ? "" : "s"} updated.`,
    };
  } catch (error) {
    console.error("Bulk update issue status error:", error);
    return { success: false, error: "Failed to update issues." };
  }
}
