import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatResourceTypes } from "@/lib/scanner/link-resource-types";
import type { LinkResourceType } from "@/lib/scanner/link-resource-types";

const MARGIN = 50;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LINE_HEIGHT = 14;

export type BrokenLinkFinding = {
  href: string;
  sourcePageUrl: string;
  statusCode: number | null;
  errorMessage: string | null;
  elementTag: string | null;
  elementId: string | null;
  elementClass: string | null;
  elementText: string | null;
  selector: string | null;
  attribute: string | null;
  severity: string;
};

export type BrokenLinksReportInput = {
  websiteName: string;
  websiteUrl: string;
  mode: string;
  resourceTypes: LinkResourceType[];
  completedAt: string | null;
  pagesCrawled: number;
  linksChecked: number;
  brokenCount: number;
  findings: BrokenLinkFinding[];
};

function wrapText(text: string, maxChars = 92) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars) : word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

class PdfWriter {
  private doc: PDFDocument;
  private page: ReturnType<PDFDocument["addPage"]>;
  private y = PAGE_HEIGHT - MARGIN;
  private embeddedRegular: Awaited<ReturnType<PDFDocument["embedFont"]>> | null = null;
  private embeddedBold: Awaited<ReturnType<PDFDocument["embedFont"]>> | null = null;

  private constructor(doc: PDFDocument, page: ReturnType<PDFDocument["addPage"]>) {
    this.doc = doc;
    this.page = page;
  }

  static async create() {
    const doc = await PDFDocument.create();
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const writer = new PdfWriter(doc, page);
    writer.embeddedRegular = await doc.embedFont(StandardFonts.Helvetica);
    writer.embeddedBold = await doc.embedFont(StandardFonts.HelveticaBold);
    return writer;
  }

  private ensureSpace(lines = 1) {
    if (this.y - lines * LINE_HEIGHT < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  drawTitle(text: string) {
    this.ensureSpace(2);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y,
      size: 18,
      font: this.embeddedBold!,
      color: rgb(0.1, 0.1, 0.1),
    });
    this.y -= LINE_HEIGHT * 2;
  }

  drawHeading(text: string) {
    this.ensureSpace(2);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y,
      size: 13,
      font: this.embeddedBold!,
      color: rgb(0.15, 0.15, 0.15),
    });
    this.y -= LINE_HEIGHT * 1.5;
  }

  drawLine(text: string, size = 10, indent = 0) {
    for (const line of wrapText(text)) {
      this.ensureSpace(1);
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y,
        size,
        font: this.embeddedRegular!,
        color: rgb(0.2, 0.2, 0.2),
      });
      this.y -= LINE_HEIGHT;
    }
  }

  drawSpacer(lines = 1) {
    this.y -= LINE_HEIGHT * lines;
  }

  async toBuffer() {
    const bytes = await this.doc.save();
    return Buffer.from(bytes);
  }
}

function drawFindingBlock(writer: PdfWriter, index: number, finding: BrokenLinkFinding) {
  const statusLabel =
    finding.statusCode !== null
      ? `HTTP ${finding.statusCode}`
      : finding.errorMessage ?? "Unreachable";

  writer.drawLine(`${index + 1}. [${finding.severity}] ${statusLabel}`, 10);
  writer.drawLine(`URL: ${finding.href}`, 9, 12);
  writer.drawLine(`Found on: ${finding.sourcePageUrl}`, 9, 12);

  const elementParts = [
    finding.elementTag ? `<${finding.elementTag}>` : null,
    finding.attribute ? `[${finding.attribute}]` : null,
    finding.elementId ? `id="${finding.elementId}"` : null,
    finding.elementClass ? `class="${finding.elementClass}"` : null,
    finding.selector ? `selector: ${finding.selector}` : null,
    finding.elementText ? `text: "${finding.elementText}"` : null,
  ].filter(Boolean);

  if (elementParts.length > 0) {
    writer.drawLine(`Element: ${elementParts.join(" ")}`, 9, 12);
  }

  writer.drawSpacer(0.75);
}

export async function generateBrokenLinksPdf(input: BrokenLinksReportInput) {
  const writer = await PdfWriter.create();
  const completedLabel = input.completedAt
    ? new Date(input.completedAt).toLocaleString("en-US")
    : new Date().toLocaleString("en-US");

  writer.drawTitle("LoopNode — Broken Links Report");
  writer.drawLine(input.websiteName, 12);
  writer.drawLine(input.websiteUrl, 10);
  writer.drawLine(`Checked: ${completedLabel}`, 10);
  writer.drawSpacer();

  writer.drawHeading("Scan summary");
  writer.drawLine(`Mode: ${input.mode === "EXTERNAL" ? "External links" : "Internal links"}`);
  writer.drawLine(`Link types: ${formatResourceTypes(input.resourceTypes)}`);
  writer.drawLine(`Pages crawled: ${input.pagesCrawled}`);
  writer.drawLine(`Links checked: ${input.linksChecked}`);
  writer.drawLine(`Broken links: ${input.brokenCount}`);
  writer.drawSpacer();

  writer.drawHeading(`Findings (${input.findings.length})`);

  if (input.findings.length === 0) {
    writer.drawLine("No broken links were found in this scan.");
  } else {
    for (const [index, finding] of input.findings.entries()) {
      drawFindingBlock(writer, index, finding);
    }
  }

  writer.drawSpacer();
  writer.drawLine("Generated by LoopNode — loopnode.app", 8);
  writer.drawLine("One-time export — not saved to your report library.", 8);

  return writer.toBuffer();
}
