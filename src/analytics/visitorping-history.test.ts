import { expect, it, vi } from "vitest";
import { fetchVisitorPingHistory } from "./visitorping-history";
const body = (rows: {path:string;pageviews:number;days:number}[], nextCursor: string|null = null) => ({ apiVersion:"1",site:{id:"internal-id",domain:"limitsregistry.com"},range:{from:"1970-01-01",to:"2026-09-19",timezone:"UTC"},traffic:"exclude_bots",generatedAt:"2026-09-20T12:00:00Z",data:{rows,nextCursor} });
const options={siteId:"internal-id",apiKey:"test-only",to:"2026-09-19"};
it("follows cursors even after short pages and preserves exact paths",async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(Response.json(body([{path:"/limits/LR-A",pageviews:4,days:2}],"opaque"))).mockResolvedValueOnce(Response.json(body([{path:"/limits/LR-A/",pageviews:2,days:1}])));
 const result=await fetchVisitorPingHistory({...options,fetcher});expect(result.rows).toHaveLength(2);expect(String(fetcher.mock.calls[1][0])).toContain("cursor=opaque");expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Bearer test-only");
});
it("refuses data from another site and repeated paths",async()=>{
 const wrong=body([]);wrong.site.domain="other.test";
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(Response.json(wrong))})).rejects.toThrow("not scoped");
 const row={path:"/a",pageviews:1,days:1};const fetcher=vi.fn().mockResolvedValueOnce(Response.json(body([row],"next"))).mockResolvedValueOnce(Response.json(body([row])));
 await expect(fetchVisitorPingHistory({...options,fetcher})).rejects.toThrow("duplicate path");
});
it("reports provider errors without echoing response bodies or keys",async()=>{
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(new Response("private details",{status:401}))})).rejects.toThrow("HTTP 401");
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(new Response("",{status:429,headers:{"retry-after":"60"}}))})).rejects.toThrow("Retry after 60");
});
