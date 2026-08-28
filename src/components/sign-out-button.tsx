"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "../auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setPending(true);
    setError("");
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
        onError: (context) => {
          setPending(false);
          setError(context.error.message || "Could not sign out.");
        },
      },
    });
  }

  return (
    <div className="sign-out-control">
      <button type="button" className="sign-out-button" onClick={handleSignOut} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error ? <span className="sign-out-error" role="alert">{error}</span> : null}
    </div>
  );
}
