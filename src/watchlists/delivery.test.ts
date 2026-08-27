import { beforeEach, describe, expect, it, vi } from "vitest";
const { repository, email } = vi.hoisted(() => ({ repository: { recoverStaleDeliveries: vi.fn(), claimDueNotifications: vi.fn(), markNotificationsSent: vi.fn(), markNotificationsFailed: vi.fn() }, email: { sendWatchlistEmail: vi.fn() } }));
vi.mock("server-only", () => ({}));
vi.mock("../db/repository.watchlists", () => repository);
vi.mock("../lib/email/watchlist-email", () => email);
import { deliverWatchlistNotifications } from "./delivery";
const row = { notification: { id: "n1", attempts: 1 }, follow: { id: "f1", frequency: "INSTANT" }, limit: { registryNumber: "LR-1", title: "Limit" }, event: { id: "e1" } };
beforeEach(() => vi.clearAllMocks());
describe("watchlist delivery", () => {
  it("marks a successful delivery sent", async () => { repository.claimDueNotifications.mockResolvedValue([row]); email.sendWatchlistEmail.mockResolvedValue({ sent: true, id: "provider-1" }); await expect(deliverWatchlistNotifications("INSTANT")).resolves.toEqual({ claimed: 1, sent: 1, failed: 0 }); expect(repository.markNotificationsSent).toHaveBeenCalledWith(["n1"], "provider-1"); });
  it("persists failures for retry", async () => { repository.claimDueNotifications.mockResolvedValue([row]); email.sendWatchlistEmail.mockResolvedValue({ sent: false, error: "temporary" }); await expect(deliverWatchlistNotifications("INSTANT")).resolves.toEqual({ claimed: 1, sent: 0, failed: 1 }); expect(repository.markNotificationsFailed).toHaveBeenCalledWith([{ id: "n1", attempts: 1 }], "temporary"); });
});
