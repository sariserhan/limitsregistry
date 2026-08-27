"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "../../src/auth/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError("This reset link is invalid or expired."); return; }
    setError(null);
    setPending(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (resetError) { setError(resetError.message ?? "Could not reset password."); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) return <>
    <h1>Reset password</h1>
    <p className="auth-error">This reset link is invalid or has expired.</p>
    <p className="auth-switch"><Link href="/forgot-password">Request a new link</Link></p>
  </>;

  if (done) return <>
    <h1>Password updated</h1>
    <p>Redirecting you to sign in…</p>
  </>;

  return <>
    <h1>Reset password</h1>
    <p>Choose a new password for your account.</p>
    <form onSubmit={handleSubmit}>
      <div className="auth-field"><label htmlFor="password">New password</label><input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Saving…" : "Save new password"}</button>
    </form>
  </>;
}
