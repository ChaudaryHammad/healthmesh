import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPortfolioIssuesForUser } from "@/lib/issue-service";
import { IssueCenterClient } from "@/components/issues/issue-center-client";

export const metadata = {
  title: "Issue Center",
};

export default async function IssuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { websites, issues } = await getPortfolioIssuesForUser(session.user.id);

  return (
    <IssueCenterClient
      websites={websites}
      issues={issues.map((issue) => ({
        ...issue,
        createdAt: issue.createdAt.toISOString(),
        acknowledgedAt: issue.acknowledgedAt?.toISOString() ?? null,
        scanCompletedAt: issue.scanCompletedAt?.toISOString() ?? null,
      }))}
    />
  );
}
