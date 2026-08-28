import { describe, expect, it } from "vitest";
import { networkingRfcRecords } from "./networking-rfc";
describe("networking RFC catalog", () => {
  it("contains 21 unique, source-backed protocol records", () => {
    expect(networkingRfcRecords).toHaveLength(21);
    expect(new Set(networkingRfcRecords.map((record) => record.registryNumber)).size).toBe(21);
    expect(new Set(networkingRfcRecords.map((record) => record.slug)).size).toBe(21);
    for (const record of networkingRfcRecords) { expect(record.sourceUrl).toBe(`https://www.rfc-editor.org/rfc/rfc${record.rfc}.html`); expect(Object.keys(record.constraints).length).toBeGreaterThan(0); expect(record.value).toMatch(/^\d+$/); }
  });
  it("preserves exceptions that prevent misleading values", () => {
    const records = new Map(networkingRfcRecords.map((record) => [record.title, record]));
    expect(records.get("Maximum ordinary UDP payload over IPv6")?.constraints).toMatchObject({ excludes: expect.arrayContaining(["IPv6 jumbograms"]) });
    expect(records.get("Default TCP MSS for IPv4")?.constraints).toMatchObject({ condition: "No MSS option received" });
    expect(records.get("QUIC default maximum UDP payload")?.constraints).toMatchObject({ distinction: "Endpoint receive limit, not a path MTU" });
    expect(records.get("DNS-over-UDP historical message-size limit")?.constraints).toMatchObject({ historical: true });
  });
});
