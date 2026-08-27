import { Suspense } from "react";
import Link from "next/link";
import ResetPasswordForm from "./reset-password-form";
import "../login/auth-form.css";

export default function ResetPasswordPage() {
  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link>
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  </main>;
}
