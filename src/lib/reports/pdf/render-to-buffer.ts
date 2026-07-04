import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";

export async function renderReactPdfToBuffer(
  document: ReactElement<DocumentProps>
): Promise<Buffer> {
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
