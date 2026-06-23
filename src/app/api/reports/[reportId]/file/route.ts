import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReportDeliveryUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*\u2014\u2013]/g, "-").replace(/\s+/g, " ").trim().slice(0, 120);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { reportId } = await context.params;
  const disposition =
    request.nextUrl.searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      website: { userId: session.user.id, deletedAt: null },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const format = report.format === "csv" ? "csv" : "pdf";
  const mimeType = format === "pdf" ? "application/pdf" : "text/csv";
  const filename = `${sanitizeFilename(report.title)}.${format}`;

  try {
    const deliveryUrl = await getReportDeliveryUrl({
      fileUrl: report.fileUrl,
      cloudinaryPublicId: report.cloudinaryPublicId,
      format,
    });

    const fileRes = await fetch(deliveryUrl);
    if (!fileRes.ok) {
      console.error("Cloudinary fetch failed:", fileRes.status, deliveryUrl);
      return NextResponse.json(
        {
          error:
            "Could not load the report file. If this is a PDF, enable PDF delivery in Cloudinary Security settings.",
        },
        { status: 502 }
      );
    }

    const buffer = await fileRes.arrayBuffer();

    if (deliveryUrl !== report.fileUrl) {
      await prisma.report.update({
        where: { id: report.id },
        data: { fileUrl: deliveryUrl },
      });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Report file route error:", error);
    return NextResponse.json({ error: "Failed to load report." }, { status: 500 });
  }
}
