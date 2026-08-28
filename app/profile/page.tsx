import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { getUserProfile } from "../../src/db/repository.profile";
import { saveProfile } from "./actions";
import "../submit/submit.css";

export default async function ProfilePage() {
  const session = await requireRole("USER");
  const profile = await getUserProfile(session.user.id);
  return <main className="submit-page"><PublicHeader /><div className="submit-content"><Link className="submit-back" href="/submit">&larr; Back to submissions</Link><h1>Your author profile</h1><p className="lede">Give editors and readers enough context to recognize the person behind a challenge. Only your name is required; the other fields are optional and self-reported.</p><section><form className="submit-form" action={saveProfile}><div className="submit-field"><label htmlFor="name">Name (shown with proposals)</label><input id="name" name="name" required minLength={2} maxLength={120} defaultValue={profile?.name ?? session.user.name} /></div><div className="submit-field"><label htmlFor="affiliation">Affiliation</label><input id="affiliation" name="affiliation" maxLength={180} placeholder="University, lab, company, or independent" defaultValue={profile?.affiliation ?? ""} /></div><div className="submit-field"><label htmlFor="orcid">ORCID</label><input id="orcid" name="orcid" placeholder="https://orcid.org/0000-0000-0000-0000" defaultValue={profile?.orcid ?? ""} /></div><div className="submit-field"><label htmlFor="website">Website</label><input id="website" name="website" type="url" placeholder="https://example.org" defaultValue={profile?.website ?? ""} /></div><button className="submit-submit" type="submit">Save author profile</button></form></section></div><SiteFooter /></main>;
}
