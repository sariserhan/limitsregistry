"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "../../src/auth/client";

function safeNext(raw: string | null) {
  // Prefix checks alone don't catch every open-redirect trick (e.g. a leading control
  // character before "//" that browsers strip during URL normalization, like "/\t//evil.com").
  // Parsing with the WHATWG URL algorithm and checking the resolved origin matches what the
  // browser will actually navigate to, so it can't be fooled by encoding/whitespace tricks.
  // A fixed dummy base (not window.location.origin) so this also works during SSR — we only
  // care whether resolving `raw` against ANY base stays on that same base, not the real origin.
  if (!raw || !raw.startsWith("/")) return "/";
  try {
    const url = new URL(raw, "http://localhost");
    return url.origin === "http://localhost" ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}

export default function LoginForm() {
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error: signInError } = await signIn.email({ email, password });
    setPending(false);
    if (signInError) { setError(signInError.message ?? "Could not sign in."); return; }
    // A client-side router.push() here can race the session cookie that signIn.email() just set
    // (or serve a prefetched pre-login copy of the destination) and silently no-op. A hard
    // navigation guarantees proxy.ts and the root layout see the fresh cookie on a real request.
    window.location.assign(next);
  }

  return <>
    <h1>Sign in</h1>
    <p>Access the Research Console and editorial tools.</p>
    <form onSubmit={handleSubmit}>
      <div className="auth-field"><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="auth-switch">No account? <Link href="/signup">Request access</Link> &middot; <Link href="/forgot-password">Forgot password?</Link></p>
  </>;
}
