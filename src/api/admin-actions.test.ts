import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), transaction: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("../auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("../db/client", () => ({ db: { transaction: mocks.transaction } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("./snapshots", () => ({ publishSnapshot: vi.fn(), snapshotStorageConfigured: () => false }));
import { issueKey, revokeKey, publishCurrentSnapshot } from "../../app/admin/api-keys/actions";
beforeEach(() => vi.resetAllMocks());
it("guards every action independently before mutation or credential generation", async () => {
  mocks.requireRole.mockRejectedValue(new Error("Access denied"));
  await expect(issueKey(new FormData())).rejects.toThrow("Access denied");
  await expect(revokeKey("any-id")).rejects.toThrow("Access denied");
  await expect(publishCurrentSnapshot()).rejects.toThrow("Access denied");
  expect(mocks.requireRole.mock.calls).toEqual([["ADMIN"], ["ADMIN"], ["ADMIN"]]);
  expect(mocks.transaction).not.toHaveBeenCalled();
});
it("validates key details and never returns a secret on persistence failure", async () => {
  mocks.requireRole.mockResolvedValue({ user: { id: "admin" } });
  expect(await issueKey(new FormData())).toHaveProperty("error");
  expect(mocks.transaction).not.toHaveBeenCalled();
  const form = new FormData(); form.set("organizationName", "Pilot"); form.set("contactEmail", "pilot@example.test");
  mocks.transaction.mockRejectedValue(new Error("database unavailable"));
  const result = await issueKey(form);
  expect(result).toHaveProperty("error");
  expect(result).not.toHaveProperty("plaintext");
});
