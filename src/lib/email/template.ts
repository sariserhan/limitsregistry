import "server-only";

const INK = "#121820";
const MUTED = "#687585";
const FAINT = "#9aa5b3";
const LINE = "#d8dee7";
const SURFACE = "#f5f7fa";
const BLUE = "#2457ff";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Escape untrusted values (e.g. a user's display name) before interpolating into EmailContent fields. */
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export type EmailContent = {
  preheader: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  note?: string;
  footer?: string;
};

/**
 * Shared transactional email shell — table-based layout with inlined styles
 * so it renders consistently across Gmail, Apple Mail, and Outlook. The
 * <style> block is a progressive enhancement for clients that support it
 * (mobile full-width button, dark-mode background/text swap).
 */
export function renderEmail({ preheader, heading, intro, ctaLabel, ctaUrl, note, footer }: EmailContent): { html: string; text: string } {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>${heading}</title>
<style>
  @media (prefers-color-scheme: dark) {
    .lr-bg { background:#0b0e13 !important; }
    .lr-card { background:#12161d !important; border-color:#232a35 !important; }
    .lr-ink { color:#f2f4f7 !important; }
    .lr-muted { color:#9aa5b3 !important; }
    .lr-line { border-color:#232a35 !important; }
  }
  @media (max-width:600px) {
    .lr-container { width:100% !important; }
    .lr-pad { padding-left:24px !important; padding-right:24px !important; }
    .lr-button { display:block !important; width:100% !important; text-align:center !important; }
  }
</style>
</head>
<body class="lr-bg" style="margin:0; padding:0; background:${SURFACE}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
  <table role="presentation" class="lr-bg" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" class="lr-container" width="560" cellpadding="0" cellspacing="0" style="width:560px; max-width:100%;">
        <tr><td class="lr-pad lr-ink" style="padding:0 8px 24px;">
          <span class="lr-ink" style="display:inline-flex; align-items:center; gap:9px; font:600 15px/1 'Space Grotesk',-apple-system,sans-serif; color:${INK}; letter-spacing:-.02em;">
            <span class="lr-line" style="display:inline-block; width:16px; height:16px; border:1.5px solid ${INK};">&nbsp;</span>
            Limits Registry
          </span>
        </td></tr>
        <tr><td class="lr-card lr-line" style="background:#fff; border:1px solid ${LINE}; padding:36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td class="lr-pad" style="padding-bottom:0;">
              <h1 class="lr-ink" style="margin:0 0 16px; font:600 24px/1.25 'Space Grotesk',-apple-system,sans-serif; letter-spacing:-.03em; color:${INK};">${heading}</h1>
              <p class="lr-muted" style="margin:0 0 28px; font-size:14px; line-height:1.6; color:${MUTED};">${intro}</p>
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:2px; background:${BLUE};">
                <a class="lr-button" href="${ctaUrl}" style="display:inline-block; padding:13px 26px; font:600 13px -apple-system,sans-serif; color:#ffffff; text-decoration:none;">${ctaLabel}</a>
              </td></tr></table>
              ${note ? `<p class="lr-muted" style="margin:24px 0 0; font-size:12px; line-height:1.6; color:${FAINT};">${note}</p>` : ""}
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="lr-pad" style="padding:24px 8px 0;">
          <p class="lr-muted" style="margin:0; font-size:11px; letter-spacing:.02em; color:${FAINT}; font-family:ui-monospace,'DM Mono',monospace;">
            ${footer ?? "Limits Registry &middot; The verified boundaries of what is possible."}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${heading}\n\n${stripHtml(intro)}\n\n${ctaLabel}: ${ctaUrl}\n\n${note ? stripHtml(note) + "\n\n" : ""}${footer ? stripHtml(footer) : "Limits Registry"}`;

  return { html, text };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}
