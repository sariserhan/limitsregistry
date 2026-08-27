import { Suspense } from "react";
import Link from "next/link";
import { BrandIcon } from "../../src/components/brand-icon";
import ResetPasswordForm from "./reset-password-form";
import "../login/auth-form.css";

export default function ResetPasswordPage() {
  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><BrandIcon className="brand-mark" /><span>Limits Registry</span></Link>
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  </main>;
}
