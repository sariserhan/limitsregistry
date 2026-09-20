import { timingSafeEqual } from "node:crypto";
import { lapseSponsorships } from "../../../../src/db/repository.sponsorships";
export const runtime="nodejs";
export async function GET(request:Request){
  const expected=Buffer.from(`Bearer ${process.env.CRON_SECRET??""}`),provided=Buffer.from(request.headers.get("authorization")??"");
  if(!process.env.CRON_SECRET||expected.length!==provided.length||!timingSafeEqual(expected,provided))return Response.json({error:"Unauthorized"},{status:401});
  try{return Response.json({lapsed:await lapseSponsorships()},{headers:{"Cache-Control":"no-store"}});}catch{return Response.json({error:"Could not expire sponsorships"},{status:503});}
}
