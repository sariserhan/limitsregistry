import Link from "next/link";
import { requireRole } from "../../src/auth/session";
import { ROLES } from "../../src/auth/permissions";
import { listUsers } from "../../src/db/repository.users";
import { listReviewerNetwork } from "../../src/db/repository.reviewers";
import { updateUserRole } from "./actions";
import "./admin.css";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");
  const [users, reviewers] = await Promise.all([listUsers(), listReviewerNetwork()]);

  return <main className="admin-shell">
    <Link href="/">&larr; Back to Registry</Link>
    <h1>Admin</h1>
    <p>Signed in as {session.user.email} · {session.user.role}. Grant Research Console and review access here.</p>
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          {users.map((u) => <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <form action={updateUserRole} style={{ display: "flex", alignItems: "center" }}>
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" defaultValue={u.role}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                <button type="submit">Save</button>
              </form>
            </td>
            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
          </tr>)}
          {users.length === 0 && <tr><td colSpan={4}>No users yet.</td></tr>}
        </tbody>
      </table>
    </div>

    <h1 style={{ fontSize: 30, marginTop: 60 }}>Reviewer network</h1>
    <p>Self-reported expertise and credentials — not independently verified.</p>
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Role</th><th>Fields of expertise</th><th>Credentials</th></tr></thead>
        <tbody>
          {reviewers.map((r) => <tr key={r.userId}>
            <td>{r.name}</td>
            <td>{r.role}</td>
            <td>{r.fieldsOfExpertise.join(", ") || "—"}</td>
            <td>{r.credentials ?? "—"}</td>
          </tr>)}
          {reviewers.length === 0 && <tr><td colSpan={4}>No reviewer profiles yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </main>;
}
