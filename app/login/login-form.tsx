"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "../../src/auth/client";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

export default function LoginForm() {
  const router = useRouter();
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
    router.push(next);
    router.refresh();
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
