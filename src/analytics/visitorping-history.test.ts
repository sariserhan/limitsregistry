import { expect, it, vi } from "vitest";
import { discoverVisitorPingSite, fetchVisitorPingHistory } from "./visitorping-history";
const body = (rows: {path:string;views:number;days:number}[], nextCursor: string|null = null) => ({ apiVersion:"1",site:{id:"internal-id",domain:"limitsregistry.com"},range:{from:"1970-01-01",to:"2026-09-19",timezone:"UTC"},generatedAt:"2026-09-20T12:00:00Z",data:{rows,nextCursor} });
const options={siteId:"internal-id",apiKey:"test-only",to:"2026-09-19"};
it("discovers the matching site without relying on a hard-coded identifier", async () => {
 const site={id:"discovered-id",siteKey:"vp_discovered",domain:"limitsregistry.com"};
 const fetcher=vi.fn().mockResolvedValue(Response.json({data:[site]}));
 expect(await discoverVisitorPingSite("test-only",fetcher)).toEqual(site);
 expect(fetcher.mock.calls[0][0]).toBe("https://visitorping.com/api/v1/sites");
 for (const data of [[],[{...site,domain:"other.test"}],[site,site]]) {
  await expect(discoverVisitorPingSite("test-only",vi.fn().mockResolvedValue(Response.json({data})))).rejects.toThrow("exactly one");
 }
});
it("follows cursors even after short pages and preserves exact paths",async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(Response.json(body([{path:"/limits/LR-A",views:4,days:2}],"opaque"))).mockResolvedValueOnce(Response.json(body([{path:"/limits/LR-A/",views:2,days:1}])));
 const result=await fetchVisitorPingHistory({...options,fetcher});expect(result.rows).toHaveLength(2);expect(String(fetcher.mock.calls[1][0])).toContain("cursor=opaque");expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Bearer test-only");
});
it("refuses data from another site and repeated paths",async()=>{
 const wrong=body([]);wrong.site.domain="other.test";
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(Response.json(wrong))})).rejects.toThrow("not scoped");
 const row={path:"/a",views:1,days:1};const fetcher=vi.fn().mockResolvedValueOnce(Response.json(body([row],"next"))).mockResolvedValueOnce(Response.json(body([row])));
 await expect(fetchVisitorPingHistory({...options,fetcher})).rejects.toThrow("duplicate path");
});
it("reports provider errors without echoing response bodies or keys",async()=>{
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(new Response("private details",{status:401}))})).rejects.toThrow("HTTP 401");
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(new Response("",{status:429,headers:{"retry-after":"60"}}))})).rejects.toThrow("Retry after 60");
});

it("omits the removed traffic filter and rejects the legacy pageviews response", async () => {
 const fetcher=vi.fn().mockResolvedValue(Response.json(body([{path:"/sponsor",views:342,days:1}])));
 await fetchVisitorPingHistory({...options,fetcher});
 expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.has("traffic")).toBe(false);
 const legacy={...body([]),data:{rows:[{path:"/",pageviews:341,days:19}],nextCursor:null}};
 await expect(fetchVisitorPingHistory({...options,fetcher:vi.fn().mockResolvedValue(Response.json(legacy))})).rejects.toThrow("Unexpected VisitorPing response shape");
});
it("uses an explicit date range for today's rankings and rejects reversed dates", async () => {
 const payload=body([{path:"/sponsor",views:342,days:1}]);
 payload.range.from="2026-09-19";
 const fetcher=vi.fn().mockResolvedValue(Response.json(payload));
 const result=await fetchVisitorPingHistory({...options,from:"2026-09-19",fetcher});
 expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.get("from")).toBe("2026-09-19");
 expect(result.from).toBe("2026-09-19");
 await expect(fetchVisitorPingHistory({...options,from:"2026-09-20",fetcher})).rejects.toThrow("date range");
});
