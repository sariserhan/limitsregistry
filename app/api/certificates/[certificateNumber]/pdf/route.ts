import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getCertificate } from "../../../../../src/db/repository";

const INK = rgb(0x12 / 255, 0x18 / 255, 0x20 / 255);
const MUTED = rgb(0x68 / 255, 0x75 / 255, 0x85 / 255);
const BLUE = rgb(0x24 / 255, 0x57 / 255, 0xff / 255);
const LINE = rgb(0xd8 / 255, 0xde / 255, 0xe7 / 255);

type PageProps = { params: Promise<{ certificateNumber: string }> };

export async function GET(_request: Request, { params }: PageProps) {
  const { certificateNumber } = await params;
  const certificate = await getCertificate(certificateNumber).catch(() => null);
  if (!certificate) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });

  const snapshot = certificate.snapshot as Record<string, unknown>;
  const claimNumber = String(snapshot.claimNumber ?? "Unknown claim");
  const registryNumber = String(snapshot.registryNumber ?? "Unknown record");
  const value = `${String(snapshot.relation ?? "")} ${String(snapshot.valueExact ?? "")}`.trim();

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Limits Registry Certificate ${certificate.certificateNumber}`);
  const page = pdf.addPage([612, 792]); // US Letter
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const marginX = 56;
  let y = 792 - 64;
  const draw = (text: string, opts: { font?: typeof bold; size?: number; color?: typeof INK; x?: number }) => {
    page.drawText(text, { x: opts.x ?? marginX, y, size: opts.size ?? 11, font: opts.font ?? regular, color: opts.color ?? INK });
  };
  const rule = () => { page.drawLine({ start: { x: marginX, y }, end: { x: 612 - marginX, y }, thickness: 0.75, color: LINE }); };

  draw("LIMITS REGISTRY", { font: bold, size: 10, color: MUTED });
  page.drawText(certificate.certificateNumber, { x: 612 - marginX - bold.widthOfTextAtSize(certificate.certificateNumber, 10), y, size: 10, font: bold, color: MUTED });
  y -= 28;
  draw(certificate.certificateType.replaceAll("_", " "), { font: bold, size: 9, color: BLUE });
  y -= 26;
  draw("Certificate of verified record", { font: bold, size: 24 });
  y -= 34;
  draw("This document certifies that the Claim identified below was accepted into the Limits", { size: 10.5, color: MUTED });
  y -= 15;
  draw("Registry under its recorded specification, evidence, and review history.", { size: 10.5, color: MUTED });
  y -= 28;
  rule();
  y -= 26;
  draw("CERTIFIED RESULT", { font: bold, size: 8.5, color: MUTED });
  y -= 24;
  draw(value || "—", { font: bold, size: 22, color: BLUE });
  y -= 18;
  draw(`${registryNumber} · ${claimNumber}`, { size: 9.5, color: MUTED });
  y -= 26;
  rule();
  y -= 26;

  const gridLeftX = marginX;
  const gridRightX = 320;
  const gridRow = (label: string, valueText: string, x: number) => {
    page.drawText(label, { x, y, size: 8.5, font: bold, color: MUTED });
    page.drawText(valueText, { x, y: y - 15, size: 11, font: bold, color: INK });
  };
  gridRow("SPECIFICATION", `Version ${String(snapshot.specificationVersion ?? "—")}`, gridLeftX);
  gridRow("EVIDENCE", `${String(snapshot.evidenceIds ? (snapshot.evidenceIds as unknown[]).length : 0)} linked items`, gridRightX);
  y -= 42;
  gridRow("INDEPENDENT REVIEWS", `${String(snapshot.acceptedReviewCount ?? 0)} accepted`, gridLeftX);
  gridRow("ISSUED", certificate.issuedAt.toISOString().slice(0, 10), gridRightX);
  y -= 40;
  rule();
  y -= 24;

  draw("RECORD FINGERPRINT · SHA-256", { font: bold, size: 8.5, color: MUTED });
  y -= 16;
  draw(certificate.recordHash, { font: mono, size: 8.5 });
  y -= 26;
  draw("SIGNATURE STATUS", { font: bold, size: 8.5, color: MUTED });
  y -= 15;
  draw(certificate.signature ? "Ed25519 signature verified by issuer" : "Hash integrity recorded · issuer signature pending", { font: bold, size: 10.5, color: certificate.signature ? BLUE : MUTED });

  y = 64;
  rule();
  y -= 18;
  draw(`Verify this certificate at limitsregistry.com/certificates/${certificate.certificateNumber}`, { size: 8.5, color: MUTED });

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${certificate.certificateNumber}.pdf"`,
      "cache-control": "private, max-age=0, no-store",
    },
  });
}
