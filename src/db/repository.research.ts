import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { breakthroughEvents, dependencyRelations, researchBounties, verificationArtifacts, watchlistEvents } from "./schema";
export const listDependencies = () => db.select().from(dependencyRelations).orderBy(desc(dependencyRelations.createdAt));
export const listVerificationArtifacts = (claimId: string) => db.select().from(verificationArtifacts).where(eq(verificationArtifacts.claimId, claimId)).orderBy(desc(verificationArtifacts.createdAt));
export const listBounties = () => db.select().from(researchBounties).orderBy(desc(researchBounties.createdAt));
export const listBreakthroughEvents = (limitId: string) => db.select().from(breakthroughEvents).where(eq(breakthroughEvents.limitId, limitId)).orderBy(desc(breakthroughEvents.occurredAt));
export const listWatchlistEvents = (limitId: string) => db.select().from(watchlistEvents).where(eq(watchlistEvents.limitId, limitId)).orderBy(desc(watchlistEvents.createdAt));
