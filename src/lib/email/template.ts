import "server-only";

const INK = "#121820";
const MUTED = "#687585";
const FAINT = "#9aa5b3";
const LINE = "#d8dee7";
const SURFACE = "#f5f7fa";
const BLUE = "#2457ff";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Escape untrusted values (e.g. a user's display name) before interpolating into email HTML. */
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

const HEAD = (title: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>${title}</title>
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
    .lr-pad { padding-left:28px !important; padding-right:28px !important; }
    .lr-button { display:block !important; width:100% !important; text-align:center !important; }
  }
</style>
</head>`;

/**
 * Shared shell for every transactional/digest email — table-based layout with
 * inlined styles so it renders consistently across Gmail, Apple Mail, and
 * Outlook. Fixed, generous padding (not content-driven) keeps every email —
 * a one-line verification notice or a full weekly digest — the same width
 * and card proportions, so none of them read as a stray, half-empty card.
 */
function shell(preheader: string, title: string, bodyHtml: string): string {
  return `${HEAD(title)}
<body class="lr-bg" style="margin:0; padding:0; background:${SURFACE}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
  <table role="presentation" class="lr-bg" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};">
    <tr><td align="center" style="padding:56px 20px;">
      <table role="presentation" class="lr-container" width="580" cellpadding="0" cellspacing="0" style="width:580px; max-width:100%;">
        <tr><td class="lr-pad lr-ink" style="padding:0 10px 28px;">
          <span class="lr-ink" style="display:inline-flex; align-items:center; gap:9px; font:600 15px/1 'Space Grotesk',-apple-system,sans-serif; color:${INK}; letter-spacing:-.02em;">
            <img src="https://limitsregistry.com/favicon-64.png" width="20" height="20" alt="" style="display:block; width:20px; height:20px;" />
            Limits Registry
          </span>
        </td></tr>
        <tr><td class="lr-card lr-line" style="background:#fff; border:1px solid ${LINE}; padding:52px 48px;">
          ${bodyHtml}
        </td></tr>
        <tr><td class="lr-pad" style="padding:28px 10px 0;">
          <p class="lr-muted" style="margin:0; font-size:11px; letter-spacing:.02em; color:${FAINT}; font-family:ui-monospace,'DM Mono',monospace;">
            Limits Registry &middot; The verified boundaries of what is possible &middot; support@limitsregistry.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Every card ends with the same signed-off block so short and long bodies land at a similar floor height. */
function signOff(note?: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
    <tr><td class="lr-line" style="border-top:1px solid ${LINE}; padding-top:24px;">
      ${note ? `<p class="lr-muted" style="margin:0 0 16px; font-size:12px; line-height:1.6; color:${FAINT};">${note}</p>` : ""}
      <p class="lr-muted" style="margin:0; font-size:13px; line-height:1.6; color:${MUTED};">— The Limits Registry editorial team</p>
    </td></tr>
  </table>`;
}

// A javascript: (or any non-http(s)) URL in an href is live in an email client — this is the
// last line of defense for any caller that didn't already validate its URLs at the source
// (see app/submit/actions.ts's safeEvidenceUrl for the write-side check on submission links).
function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function button(label: string, url: string): string {
  const href = safeHref(url);
  if (!href) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr><td style="border-radius:2px; background:${BLUE};">
    <a class="lr-button" href="${href}" style="display:inline-block; padding:14px 28px; font:600 13px -apple-system,sans-serif; color:#ffffff; text-decoration:none;">${escapeHtml(label)}</a>
  </td></tr></table>`;
}

export type EmailContent = { preheader: string; heading: string; intro: string; ctaLabel: string; ctaUrl: string; note?: string };

/** Single-CTA transactional shape: verification, password reset, welcome. */
export function renderEmail({ preheader, heading, intro, ctaLabel, ctaUrl, note }: EmailContent): { html: string; text: string } {
  const body = `<h1 class="lr-ink" style="margin:0 0 18px; font:600 26px/1.3 'Space Grotesk',-apple-system,sans-serif; letter-spacing:-.03em; color:${INK};">${heading}</h1>
    <p class="lr-muted" style="margin:0; font-size:15px; line-height:1.7; color:${MUTED};">${intro}</p>
    ${button(ctaLabel, ctaUrl)}
    ${signOff(note)}`;

  const html = shell(preheader, heading, body);
  const text = `${heading}\n\n${stripHtml(intro)}\n\n${ctaLabel}: ${ctaUrl}\n\n${note ? stripHtml(note) + "\n\n" : ""}— The Limits Registry editorial team\n\nLimits Registry · support@limitsregistry.com`;
  return { html, text };
}

export type DigestItem = { label: string; title: string; meta: string; url: string };

export type DigestContent = { preheader: string; heading: string; intro: string; sections: { title: string; items: DigestItem[] }[]; ctaLabel: string; ctaUrl: string; note?: string };

/**
 * List-based shape for the weekly digest — same shell/proportions as the single-CTA emails.
 * Every field here can originate from public, unauthenticated input (a submission title comes
 * straight from /submit), so — unlike renderEmail, whose callers pre-escape at the call site —
 * this escapes every interpolated field itself. Safe to call with raw data; callers never have
 * to remember to escape.
 */
export function renderDigestEmail({ preheader, heading, intro, sections, ctaLabel, ctaUrl, note }: DigestContent): { html: string; text: string } {
  const sectionsHtml = sections.map((section) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
      <tr><td>
        <p class="lr-muted" style="margin:0 0 14px; font:600 11px 'DM Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:.08em; color:${FAINT};">${escapeHtml(section.title)} (${section.items.length})</p>
        ${section.items.length === 0
      ? `<p class="lr-muted" style="margin:0; font-size:13px; color:${FAINT};">Nothing this week.</p>`
      : section.items.map((item, i) => {
        const href = safeHref(item.url);
        const label = `${escapeHtml(item.label)} — ${escapeHtml(item.title)}`;
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${i > 0 ? `border-top:1px solid ${LINE};` : ""}">
              <tr><td style="padding:14px 0;">
                ${href ? `<a href="${href}" class="lr-ink" style="font:600 14px 'Space Grotesk',-apple-system,sans-serif; color:${INK}; text-decoration:none;">${label}</a>` : `<span class="lr-ink" style="font:600 14px 'Space Grotesk',-apple-system,sans-serif; color:${INK};">${label}</span>`}<br/>
                <span class="lr-muted" style="font-size:12px; color:${MUTED};">${escapeHtml(item.meta)}</span>
              </td></tr>
            </table>`;
      }).join("")}
      </td></tr>
    </table>`).join("");

  const body = `<h1 class="lr-ink" style="margin:0 0 18px; font:600 26px/1.3 'Space Grotesk',-apple-system,sans-serif; letter-spacing:-.03em; color:${INK};">${escapeHtml(heading)}</h1>
    <p class="lr-muted" style="margin:0; font-size:15px; line-height:1.7; color:${MUTED};">${escapeHtml(intro)}</p>
    ${sectionsHtml}
    ${button(ctaLabel, ctaUrl)}
    ${signOff(note ? escapeHtml(note) : undefined)}`;

  const html = shell(escapeHtml(preheader), escapeHtml(heading), body);
  const textSections = sections.map((s) => `${s.title} (${s.items.length})\n${s.items.length === 0 ? "Nothing this week." : s.items.map((i) => `- ${i.label} — ${i.title} (${i.meta}): ${i.url}`).join("\n")}`).join("\n\n");
  const text = `${heading}\n\n${intro}\n\n${textSections}\n\n${ctaLabel}: ${ctaUrl}\n\n${note ? note + "\n\n" : ""}— The Limits Registry editorial team\n\nLimits Registry · support@limitsregistry.com`;
  return { html, text };
}
