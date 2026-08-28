import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { getCertificate } from "../../../src/db/repository";
import PrintButton from "./PrintButton";

type PageProps = { params: Promise<{ certificateNumber: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateNumber } = await params;
  const certificate = await getCertificate(certificateNumber).catch(() => null);
  if (!certificate) return { title: "Certificate not found — Limits Registry" };
  const snapshot = certificate.snapshot;
  const registryNumber = String(snapshot.registryNumber ?? "Unknown record");
  const value = `${String(snapshot.relation ?? "")} ${String(snapshot.valueExact ?? "")}`.trim();
  const title = `Certificate ${certificate.certificateNumber} (${registryNumber}) — Limits Registry`;
  const description = `Integrity certificate for ${registryNumber}: ${value}. SHA-256 hash and, where signed, an Ed25519 signature verifying this result hasn't changed since certification.`;
  const path = `/certificates/${certificate.certificateNumber}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertificatePage({ params }: PageProps) {
  const { certificateNumber } = await params;
  const certificate = await getCertificate(certificateNumber).catch(() => null);
  if (!certificate) return <main className="certificate-page"><PublicHeader /><section className="certificate-not-found"><p className="section-kicker">Certificate lookup</p><h1>Certificate not found.</h1><p>This certificate number does not resolve to a published Registry certificate.</p><Link href="/">Return to Registry ↗</Link></section><SiteFooter /></main>;
  const snapshot = certificate.snapshot; const claimNumber = String(snapshot.claimNumber ?? "Unknown claim"); const registryNumber = String(snapshot.registryNumber ?? "Unknown record"); const value = `${String(snapshot.relation ?? "")} ${String(snapshot.valueExact ?? "")}`.trim();
  return <main className="certificate-page"><PublicHeader /><section className="certificate-sheet"><div className="certificate-topline"><span>LIMITS REGISTRY</span><span>VERIFICATION DOCUMENT</span><span>{certificate.certificateNumber}</span></div><div className="certificate-seal" aria-label="Limits Registry seal"><Image className="certificate-seal-image" src="/icon-no-bg.png" width={96} height={96} alt="Limits Registry seal" priority /></div><p className="section-kicker">{certificate.certificateType.replaceAll("_", " ")}</p><h1>Certificate of<br /><em>verified record</em></h1><p className="certificate-lede">This document certifies that the Claim identified below was accepted into the Limits Registry under its recorded specification, evidence, and review history.</p><div className="certificate-result"><span>Certified result</span><strong>{value}</strong><small>{registryNumber} · {claimNumber}</small></div><div className="certificate-grid"><div><span>Specification</span><strong>Version {String(snapshot.specificationVersion ?? "—")}</strong></div><div><span>Evidence</span><strong>{String(snapshot.evidenceIds ? (snapshot.evidenceIds as unknown[]).length : 0)} linked items</strong></div><div><span>Independent reviews</span><strong>{String(snapshot.acceptedReviewCount ?? 0)} accepted</strong></div><div><span>Issued</span><strong>{certificate.issuedAt.toISOString().slice(0, 10)}</strong></div></div><div className="certificate-integrity"><div><span>Record fingerprint · SHA-256</span><code>{certificate.recordHash}</code></div><div><span>Signature status</span><strong className={certificate.signature ? "signed" : "unsigned"}>{certificate.signature ? "Ed25519 signature verified by issuer" : "Hash integrity recorded · issuer signature pending"}</strong></div></div><div className="certificate-footer"><span>Active certificate · immutable snapshot</span><div className="certificate-footer-actions"><a className="certificate-download" href={`/api/certificates/${certificate.certificateNumber}/pdf`}>Download PDF ↓</a><PrintButton /></div></div></section><SiteFooter /></main>;
}
