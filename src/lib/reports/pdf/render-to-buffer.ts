import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";

/**
 * Disable syllable hyphenation. The previous per-character callback caused
 * visible gaps ("https:/ / example. com") and cut/weird text in PDF viewers.
 * Long URLs wrap via soft breaks from pdfBreakableText instead.
 */
Font.registerHyphenationCallback((word) => [word]);

export async function renderReactPdfToBuffer(
  document: ReactElement<DocumentProps>
): Promise<Buffer> {
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
