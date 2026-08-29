import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { limits } from "./schema";

export type LimitCollection = {
  slug: string;
  title: string;
  description: string;
  categories?: string[];
  status?: "OPEN" | "PROVEN";
  recent?: boolean;
};

export const LIMIT_COLLECTIONS: LimitCollection[] = [
  { slug: "fundamental-limits-of-physics", title: "Fundamental Limits of Physics", description: "Published physical bounds on matter, motion, information, and the behavior of the universe.", categories: ["Physics"] },
  { slug: "open-limits-in-computing", title: "Open Limits in Computing", description: "Unresolved frontiers in computation, algorithms, complexity, storage, and networks.", categories: ["Computing", "Algorithms", "Data Storage", "Networking"], status: "OPEN" },
  { slug: "proven-limits-in-information-theory", title: "Proven Limits in Information Theory", description: "Accepted information-theoretic bounds on communication, coding, compression, and signal recovery.", categories: ["Information Theory", "Signal Processing"], status: "PROVEN" },
  { slug: "limits-of-artificial-intelligence", title: "Limits of Artificial Intelligence", description: "Theoretical and empirical boundaries on learning systems, models, agents, and AI performance.", categories: ["AI", "Artificial Intelligence"] },
  { slug: "unsolved-limits-in-biology", title: "Unsolved Limits in Biology", description: "Open biological frontiers spanning genomes, cells, organisms, evolution, and living systems.", categories: ["Biology"], status: "OPEN" },
  { slug: "physical-limits-of-energy", title: "The Physical Limits of Energy", description: "Limits on energy density, conversion, transport, efficiency, and the useful work available in physical systems.", categories: ["Energy", "Physics", "Engineering"] },
  { slug: "recently-proven-scientific-limits", title: "Recently Proven Scientific Limits", description: "The newest published records whose accepted claims establish or sharpen a scientific frontier.", status: "PROVEN", recent: true },
  { slug: "chemistry-limits", title: "Limits of Chemistry", description: "Measured and theoretical boundaries on atoms, molecules, reactions, and materials.", categories: ["Chemistry"] },
  { slug: "frontiers-in-materials-science", title: "Frontiers in Materials Science", description: "Strength, conductivity, fracture, phase, and energy-density limits across engineered materials.", categories: ["Materials Science"], },
  { slug: "earth-and-climate-frontiers", title: "Earth and Climate Frontiers", description: "Extremes and boundaries recorded across Earth’s atmosphere, oceans, climate, and geology.", categories: ["Earth & Climate"] },
  { slug: "medicine-and-human-physiology", title: "Medicine and Human Physiology", description: "Documented boundaries on human performance, lifespan, dosage, and physiological response.", categories: ["Medicine & Physiology"] },
  { slug: "mathematical-limits", title: "Mathematical Limits", description: "Open and proven boundaries in combinatorics, number theory, geometry, and algorithms.", categories: ["Mathematics"] },
];

export function getLimitCollection(slug: string) {
  return LIMIT_COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
}

export async function listCollectionLimits(collection: LimitCollection, resultLimit = 100) {
  const conditions = [inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const)];
  if (collection.categories?.length) conditions.push(inArray(limits.category, collection.categories));
  if (collection.status) conditions.push(eq(limits.status, collection.status));
  const rows = await db.select().from(limits).where(and(...conditions)).orderBy(collection.recent ? desc(limits.updatedAt) : asc(limits.title), asc(limits.registryNumber)).limit(Math.min(Math.max(resultLimit, 1), 100));
  return rows;
}

export async function countCollectionLimits(collection: LimitCollection) {
  const conditions = [inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const)];
  if (collection.categories?.length) conditions.push(inArray(limits.category, collection.categories));
  if (collection.status) conditions.push(eq(limits.status, collection.status));
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(limits).where(and(...conditions));
  return row?.count ?? 0;
}
