import { connection } from "next/server";
import { listActiveSponsorPlacements, listActiveCategorySponsorPlacements } from "../db/repository.sponsorships";
import { httpsUrl } from "../domain/bounty-sponsorship";
export async function SponsorPlacements({limitId,category}:{limitId?:string;category?:string}) {
  await connection();
  const placements=category?await listActiveCategorySponsorPlacements(category):limitId?await listActiveSponsorPlacements(limitId):[];
  if(!placements.length)return null;
  return <section aria-label="Sponsored bounties">{placements.map(term=><div className="canonical-bounty" key={term.id}><span className="aside-label">{term.category?`Category sponsor · ${term.category}`:"Sponsored bounty"}</span><strong>{term.title}</strong>{term.category&&<><small>{term.amount} {term.currency} shared award pool across the category; not a separate award for each Limit.</small>{httpsUrl.safeParse(term.sourceUrl).success&&<a href={term.sourceUrl} target="_blank" rel="sponsored noopener noreferrer">Official award terms ↗</a>}</>}{httpsUrl.safeParse(term.sponsorUrl).success&&<a href={term.sponsorUrl} target="_blank" rel="sponsored noopener noreferrer">{term.sponsor} ↗</a>}<small>Paid placement until {term.endsAt!.toISOString().slice(0,16).replace("T"," ")} UTC. Award terms and payment are the sponsor’s responsibility.</small></div>)}</section>;
}
