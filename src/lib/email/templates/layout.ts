interface LayoutOptions {
  preheader?: string;
  title: string;
  body: string;
  footerNote?: string;
}

export function renderEmailLayout({ preheader, title, body, footerNote }: LayoutOptions): string {
  const year = new Date().getFullYear();
  const footer =
    footerNote ??
    `You received this email because of an action on your LoopNode account or subscription.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:10px 18px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">LoopNode</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 32px 8px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#f9fafb;line-height:1.3;">${escapeHtml(title)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 32px;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.6;">${footer}</p>
              <p style="margin:0;font-size:11px;color:#4b5563;">© ${year} LoopNode. Website health monitoring.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#7c3aed);">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#d1d5db;">${text}</p>`;
}

export function emailMuted(text: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.55;color:#9ca3af;">${text}</p>`;
}

export function emailCodeBlock(text: string): string {
  return `<p style="margin:16px 0 0;padding:12px 14px;background-color:#0b1120;border:1px solid #1f2937;border-radius:8px;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${escapeHtml(text)}</p>`;
}

export function emailInfoBox(title: string, rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows
    .map(
      (row) => `<tr>
        <td style="padding:8px 0;font-size:13px;color:#9ca3af;vertical-align:top;width:90px;">${escapeHtml(row.label)}</td>
        <td style="padding:8px 0;font-size:13px;color:#e5e7eb;word-break:break-word;">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#0b1120;border:1px solid #1f2937;border-radius:10px;">
  <tr><td style="padding:16px;">
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#f3f4f6;">${escapeHtml(title)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
  </td></tr>
</table>`;
}
