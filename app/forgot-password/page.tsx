"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../src/auth/client";
import "../login/auth-form.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error: requestError } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (requestError) { setError(requestError.message ?? "Could not send reset email."); return; }
    setSent(true);
  }

  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link>
    <h1>Reset password</h1>
    {sent ? <p>If an account exists for {email}, a reset link is on its way. Check your inbox.</p> : <>
      <p>Enter your account email and we&rsquo;ll send a link to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <div className="auth-field"><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
      </form>
    </>}
    <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
  </main>;
}
