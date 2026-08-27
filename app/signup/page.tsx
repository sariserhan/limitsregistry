"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandIcon } from "../../src/components/brand-icon";
import { signUp } from "../../src/auth/client";
import "../login/auth-form.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error: signUpError } = await signUp.email({ name, email, password });
    setPending(false);
    if (signUpError) { setError(signUpError.message ?? "Could not create account."); return; }
    router.push("/");
    router.refresh();
  }

  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><BrandIcon className="brand-mark" /><span>Limits Registry</span></Link>
    <h1>Request access</h1>
    <p>New accounts start with read-only access. An admin grants Research Console and review permissions.</p>
    <form onSubmit={handleSubmit}>
      <div className="auth-field"><label htmlFor="name">Name</label><input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="auth-field"><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
  </main>;
}
