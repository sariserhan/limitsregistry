import { unstable_cache } from "next/cache";
import { listActiveSponsorPlacements, listActiveCategorySponsorPlacements } from "../db/repository.sponsorships";
import { httpsUrl } from "../domain/bounty-sponsorship";

// Cached rather than read per request (this used connection()), which would make every record page
// uncacheable. The 5 minutes also caps how long the surrounding cached page can go without a
// refresh, so a timed placement starts and ends within about 5 minutes of its dates. Dates come
// back from this cache as strings despite their type, hence new Date() below.
const listPlacements=unstable_cache(
  async(limitId?:string,category?:string)=>category?listActiveCategorySponsorPlacements(category):limitId?listActiveSponsorPlacements(limitId):[],
  ["sponsor-placements-v1"],
  {revalidate:300,tags:["sponsor-placements"]},
);

export async function SponsorPlacements({limitId,category}:{limitId?:string;category?:string}) {
  const placements=await listPlacements(limitId,category);
  if(!placements.length)return null;
  return <section aria-label="Sponsored bounties">{placements.map(term=><div className="canonical-bounty" key={term.id}><span className="aside-label">{term.category?`Category sponsor · ${term.category}`:"Sponsored bounty"}</span><strong>{term.title}</strong>{term.category&&<><small>{term.amount} {term.currency} shared award pool across the category; not a separate award for each Limit.</small>{httpsUrl.safeParse(term.sourceUrl).success&&<a href={term.sourceUrl} target="_blank" rel="sponsored noopener noreferrer">Official award terms ↗</a>}</>}{httpsUrl.safeParse(term.sponsorUrl).success&&<a href={term.sponsorUrl} target="_blank" rel="sponsored noopener noreferrer">{term.sponsor} ↗</a>}<small>Paid placement until {new Date(term.endsAt!).toISOString().slice(0,16).replace("T"," ")} UTC. Award terms and payment are the sponsor’s responsibility.</small></div>)}</section>;
}
