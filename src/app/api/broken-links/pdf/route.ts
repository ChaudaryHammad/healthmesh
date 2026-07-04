import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBrokenLinksPdf } from "@/lib/reports/generate-broken-links-pdf";
import type { LinkResourceType } from "@/lib/scanner/link-resource-types";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const brokenLinkFindingSchema = z.object({
  href: z.string(),
  sourcePageUrl: z.string(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  elementTag: z.string().nullable(),
  elementId: z.string().nullable(),
  elementClass: z.string().nullable(),
  elementText: z.string().nullable(),
  selector: z.string().nullable(),
  attribute: z.string().nullable(),
  severity: z.string(),
});

const bodySchema = z.object({
  websiteId: z.string().min(1),
  websiteName: z.string().min(1),
  websiteUrl: z.string().url(),
  mode: z.enum(["INTERNAL", "EXTERNAL"]),
  resourceTypes: z.array(z.string()).min(1),
  completedAt: z.string().nullable(),
  pagesCrawled: z.number().int().min(0),
  linksChecked: z.number().int().min(0),
  brokenCount: z.number().int().min(0),
  findings: z.array(brokenLinkFindingSchema),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid report data." },
      { status: 400 }
    );
  }

  const website = await prisma.website.findFirst({
    where: {
      id: parsed.data.websiteId,
      userId: session.user.id,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!website) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  try {
    const buffer = await generateBrokenLinksPdf({
      websiteName: parsed.data.websiteName,
      websiteUrl: parsed.data.websiteUrl,
      mode: parsed.data.mode,
      resourceTypes: parsed.data.resourceTypes as LinkResourceType[],
      completedAt: parsed.data.completedAt,
      pagesCrawled: parsed.data.pagesCrawled,
      linksChecked: parsed.data.linksChecked,
      brokenCount: parsed.data.brokenCount,
      findings: parsed.data.findings,
    });

    const dateLabel = (parsed.data.completedAt ?? new Date().toISOString()).slice(0, 10);
    const safeName = parsed.data.websiteName.replace(/[<>:"/\\|?*]/g, "-").slice(0, 60);
    const filename = `broken-links-${safeName}-${dateLabel}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Broken links PDF API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
