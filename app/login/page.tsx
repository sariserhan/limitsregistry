import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./login-form";
import "./auth-form.css";

export default function LoginPage() {
  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link>
    <Suspense>
      <LoginForm />
    </Suspense>
  </main>;
}
