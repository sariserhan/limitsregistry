import { renderEmail, renderDigestEmail } from "../../../src/lib/email/template";
import { EmailGallery } from "./EmailGallery";

export default function AdminEmailsPage() {
  const samples = [
    {
      name: "Verify email",
      html: renderEmail({
        preheader: "Confirm your email address for Limits Registry.",
        heading: "Verify your email",
        intro: "Hi Jane, confirm this is your email address to finish setting up your Limits Registry account.",
        ctaLabel: "Verify email address",
        ctaUrl: "https://limitsregistry.com/verify?token=sample",
        note: "If you didn't create this account, you can safely ignore this email.",
      }).html,
    },
    {
      name: "Reset password",
      html: renderEmail({
        preheader: "Reset your Limits Registry password.",
        heading: "Reset your password",
        intro: "Hi Jane, we received a request to reset the password on your Limits Registry account. This link expires in 1 hour.",
        ctaLabel: "Reset password",
        ctaUrl: "https://limitsregistry.com/reset-password?token=sample",
        note: "If you didn't request this, you can safely ignore this email — your password won't change.",
      }).html,
    },
    {
      name: "Welcome",
      html: renderEmail({
        preheader: "Your Limits Registry account is verified.",
        heading: "Welcome, Jane",
        intro: "Your email is verified. New accounts start with read-only access — an admin grants Research Console and review permissions from there.",
        ctaLabel: "Explore the Registry",
        ctaUrl: "https://limitsregistry.com",
        note: "Questions about access? Reply to this email and it'll reach Support directly.",
      }).html,
    },
    {
      name: "Admin compose",
      html: renderEmail({
        preheader: "This is the main message.",
        heading: "Hello there,",
        intro: "This is the main message body an admin writes from the Send Email tab.",
        ctaLabel: "",
        ctaUrl: "",
        note: "A closing note shown below the body.",
      }).html,
    },
    {
      name: "Weekly digest",
      html: renderDigestEmail({
        preheader: "3 updates this week on Limits Registry.",
        heading: "Weekly digest — Aug 20 – Aug 27",
        intro: "Hi Jane, here's what moved on the Registry this week: 1 newly published Limit, 1 accepted Claim, and 1 new public submission.",
        sections: [
          { title: "Newly published Limits", items: [{ label: "LR-000042", title: "Sample published limit", meta: "Newly published", url: "https://limitsregistry.com/limits/LR-000042" }] },
          { title: "Accepted Claims", items: [{ label: "CLM-000100", title: "Sample accepted claim", meta: "Accepted on LR-000012", url: "https://limitsregistry.com/limits/LR-000012" }] },
          { title: "New public submissions", items: [{ label: "LR-000007", title: "Sample submission", meta: "Status: SUBMITTED", url: "https://limitsregistry.com/console" }] },
        ],
        ctaLabel: "Open the Research Console",
        ctaUrl: "https://limitsregistry.com/console",
        note: "You're getting this because you hold an editorial role (Editor, Admin, or Superadmin) on Limits Registry.",
      }).html,
    },
  ];

  return <section className="admin-section">
    <h2>Emails</h2>
    <p>Every email template this app sends, rendered with sample data. Toggle mobile/desktop to check responsiveness.</p>
    <EmailGallery samples={samples} />
  </section>;
}
