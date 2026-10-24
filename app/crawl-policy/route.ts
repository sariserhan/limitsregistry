import { limitsRegistryDocumentResponse } from "../../src/ops/crawl-policy";

export const dynamic = "force-static";
export function GET() { return limitsRegistryDocumentResponse("/crawl-policy")!; }
export function HEAD() { return limitsRegistryDocumentResponse("/crawl-policy", "HEAD")!; }
