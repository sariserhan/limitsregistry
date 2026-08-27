import "server-only";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "./client";
import { candidateClaims, papers, sourceIngestionJobs } from "./schema";
import { validatePdfSourceUrl } from "../lib/ingestion/source-security";

export type SourceJobStatus = "QUEUED" | "PROCESSING" | "RETRY_WAIT" | "SUCCEEDED" | "FAILED";
export async function enqueueSourceIngestion(input: { paperId: string; limitId: string | null; requestedByUserId: string; sourceUrl: string; sourceType: "ARXIV" | "DOI_PUBLISHER" }) {
  const sourceUrl = validatePdfSourceUrl(input.sourceUrl).toString();
  const [paper] = await db.select({ id: papers.id }).from(papers).where(eq(papers.id, input.paperId));
  if (!paper) throw new Error("Paper not found.");
  const active = await db.select({ id: sourceIngestionJobs.id }).from(sourceIngestionJobs).where(and(eq(sourceIngestionJobs.paperId, input.paperId), inArray(sourceIngestionJobs.status, ["QUEUED", "PROCESSING", "RETRY_WAIT"]))).limit(1);
  if (active.length) throw new Error("This paper already has an active PDF extraction job.");
  const [job] = await db.insert(sourceIngestionJobs).values({ ...input, sourceUrl }).returning();
  return job;
}
export async function listSourceIngestionJobs() {
  return db.select({ job: sourceIngestionJobs, paper: { title: papers.title, arxivId: papers.arxivId, doi: papers.doi } }).from(sourceIngestionJobs).innerJoin(papers, eq(papers.id, sourceIngestionJobs.paperId)).orderBy(desc(sourceIngestionJobs.createdAt));
}
export async function recoverStaleSourceJobs(now = new Date()) {
  const stale = new Date(now.getTime() - 10 * 60_000);
  return db.update(sourceIngestionJobs).set({ status: "RETRY_WAIT", errorCode: "WORKER_TIMEOUT", errorMessage: "Worker lease expired; retry scheduled.", nextAttemptAt: now, updatedAt: now }).where(and(eq(sourceIngestionJobs.status, "PROCESSING"), lte(sourceIngestionJobs.startedAt, stale))).returning({ id: sourceIngestionJobs.id });
}
export async function claimNextSourceJob(now = new Date()) {
  return db.transaction(async (tx) => {
    const rows = await tx.execute(sql`select id from source_ingestion_jobs where status in ('QUEUED','RETRY_WAIT') and next_attempt_at <= ${now.toISOString()}::timestamptz order by next_attempt_at asc, created_at asc for update skip locked limit 1`);
    const id = (rows as unknown as Array<{ id: string }>)[0]?.id;
    if (!id) return null;
    const [job] = await tx.update(sourceIngestionJobs).set({ status: "PROCESSING", attempts: sql`${sourceIngestionJobs.attempts} + 1`, startedAt: now, errorCode: null, errorMessage: null, updatedAt: now }).where(eq(sourceIngestionJobs.id, id)).returning();
    return job ?? null;
  });
}
export async function completeSourceJob(input: { jobId: string; finalSourceUrl: string; pageCount: number; byteSize: number; extractedCharacterCount: number; extraction: Record<string, unknown>; model: string; promptVersion: string }, now = new Date()) {
  return db.transaction(async (tx) => {
    const [job] = await tx.select().from(sourceIngestionJobs).where(eq(sourceIngestionJobs.id, input.jobId));
    if (!job || job.status !== "PROCESSING") throw new Error("Source job is not processing.");
    await tx.insert(candidateClaims).values({ paperId: job.paperId, limitId: job.limitId, extraction: input.extraction, model: input.model, promptVersion: input.promptVersion });
    const [updated] = await tx.update(sourceIngestionJobs).set({ status: "SUCCEEDED", finalSourceUrl: input.finalSourceUrl, pageCount: input.pageCount, byteSize: input.byteSize, extractedCharacterCount: input.extractedCharacterCount, completedAt: now, updatedAt: now }).where(eq(sourceIngestionJobs.id, job.id)).returning();
    return updated;
  });
}
export async function failSourceJob(jobId: string, error: unknown, now = new Date()) {
  const [job] = await db.select().from(sourceIngestionJobs).where(eq(sourceIngestionJobs.id, jobId));
  if (!job || job.status !== "PROCESSING") return null;
  const message = error instanceof Error ? error.message.slice(0, 1000) : "Unknown ingestion failure.";
  const permanent = /allowlist|private|credential|15 MB|page extraction limit|PDF signature|not return a PDF/i.test(message);
  const exhausted = job.attempts >= job.maxAttempts;
  const failed = permanent || exhausted;
  const delayMinutes = Math.min(60, 2 ** Math.max(0, job.attempts - 1));
  const [updated] = await db.update(sourceIngestionJobs).set({ status: failed ? "FAILED" : "RETRY_WAIT", errorCode: permanent ? "SOURCE_REJECTED" : exhausted ? "RETRIES_EXHAUSTED" : "TRANSIENT_FAILURE", errorMessage: message, nextAttemptAt: failed ? now : new Date(now.getTime() + delayMinutes * 60_000), completedAt: failed ? now : null, updatedAt: now }).where(eq(sourceIngestionJobs.id, jobId)).returning();
  return updated;
}
