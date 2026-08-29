import { ROLES } from "../../src/auth/permissions";
import { listUsers } from "../../src/db/repository.users";
import { listReviewerNetwork } from "../../src/db/repository.reviewers";
import { getSession } from "../../src/auth/session";
import { updateUserRole } from "./actions";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function AdminUsersPage() {
  const [users, reviewers, session] = await Promise.all([listUsers(), listReviewerNetwork(), getSession()]);
  // Deletion anonymizes an account outright with no further review step, so it's held to the same
  // bar as touching another admin-tier role — SUPERADMIN only, matching updateUserRole's own gate.
  const canDelete = session?.user.role === "SUPERADMIN";

  return <>
    <section className="admin-section">
      <h2>Users</h2>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th>{canDelete && <th>Delete</th>}</tr></thead>
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
              {canDelete && <td>{u.id !== session?.user.id && <DeleteUserButton userId={u.id} email={u.email} />}</td>}
            </tr>)}
            {users.length === 0 && <tr><td colSpan={canDelete ? 5 : 4}>No users yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>

    <section className="admin-section">
      <h2>Reviewer network</h2>
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
    </section>
  </>;
}
