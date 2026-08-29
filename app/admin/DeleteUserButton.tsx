"use client";

import { deleteUserAccount } from "./actions";

export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  return (
    <form
      action={deleteUserAccount}
      onSubmit={(event) => {
        if (!confirm(`Delete ${email}? Their submissions, claims, and reviews stay on the record — only the account itself is removed and can no longer sign in. This can't be undone.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className="admin-delete-button">Delete</button>
    </form>
  );
}
