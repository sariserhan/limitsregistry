import { Suspense } from "react";
import Link from "next/link";
import { BrandIcon } from "../../src/components/brand-icon";
import LoginForm from "./login-form";
import "./auth-form.css";

export default function LoginPage() {
  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><BrandIcon className="brand-mark" /><span>Limits Registry</span></Link>
    <Suspense>
      <LoginForm />
    </Suspense>
  </main>;
}
