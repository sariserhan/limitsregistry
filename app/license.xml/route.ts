import { limitsRegistryDocumentResponse } from "../../src/ops/crawl-policy";

export const dynamic = "force-static";
export function GET() { return limitsRegistryDocumentResponse("/license.xml")!; }
export function HEAD() { return limitsRegistryDocumentResponse("/license.xml", "HEAD")!; }
