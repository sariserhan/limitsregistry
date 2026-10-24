import { limitsRegistryDocumentResponse } from "../../src/ops/crawl-policy";

export const dynamic = "force-static";
export function GET() { return limitsRegistryDocumentResponse("/robots.txt")!; }
export function HEAD() { return limitsRegistryDocumentResponse("/robots.txt", "HEAD")!; }
