"use client";

import Link from "next/link";
import { useSession } from "../auth/client";

// Client-only piece of an otherwise static/server-rendered PublicHeader — checking the session
// server-side would force every public page using PublicHeader to become dynamic. This fetches
// the session client-side instead, after the static shell has already rendered.
export function HeaderAccountLink() {
  const { data: session, isPending } = useSession();
  if (isPending || !session?.user) return null;
  return <Link className="public-header-account" href="/account">Account</Link>;
}
