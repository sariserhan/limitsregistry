import { connection } from "next/server";
import { listActiveSponsorPlacements } from "../db/repository.sponsorships";
import { httpsUrl } from "../domain/bounty-sponsorship";
export async function SponsorPlacements({limitId}:{limitId:string}) {
  await connection();
  const placements=await listActiveSponsorPlacements(limitId);
  if(!placements.length)return null;
  return <section aria-label="Sponsored bounties">{placements.map(term=><div className="canonical-bounty" key={term.id}><span className="aside-label">Sponsored bounty</span><strong>{term.title}</strong>{httpsUrl.safeParse(term.sponsorUrl).success&&<a href={term.sponsorUrl} target="_blank" rel="sponsored noopener noreferrer">{term.sponsor} ↗</a>}<small>Paid placement until {term.endsAt!.toISOString().slice(0,16).replace("T"," ")} UTC. Award terms and payment are the sponsor’s responsibility.</small></div>)}</section>;
}
