import "server-only";
import { createHash } from "node:crypto";
import { embed, embedMany } from "ai";
import { gateway } from "@ai-sdk/gateway";
export const SEARCH_EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const SEARCH_EMBEDDING_DIMENSIONS = 1536;
const model = gateway.embeddingModel(SEARCH_EMBEDDING_MODEL);
export const contentHash = (content: string) => createHash("sha256").update(content).digest("hex");
export async function embedSearchQuery(query: string) { const result = await embed({ model, value: query, maxRetries: 2 }); if (result.embedding.length !== SEARCH_EMBEDDING_DIMENSIONS) throw new Error(`Expected ${SEARCH_EMBEDDING_DIMENSIONS} embedding dimensions.`); return result.embedding; }
export async function embedSearchDocuments(contents: string[]) { if (!contents.length) return []; const result = await embedMany({ model, values: contents, maxParallelCalls: 2, maxRetries: 2 }); for (const embedding of result.embeddings) if (embedding.length !== SEARCH_EMBEDDING_DIMENSIONS) throw new Error(`Expected ${SEARCH_EMBEDDING_DIMENSIONS} embedding dimensions.`); return result.embeddings; }
