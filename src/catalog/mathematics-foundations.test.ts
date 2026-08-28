import { describe, expect, it } from "vitest";
import { mathematicsFoundationRecords } from "./mathematics-foundations";
describe("mathematics foundation catalog", () => {
  it("covers all 21 requested records without duplicate titles", () => { expect(mathematicsFoundationRecords).toHaveLength(21); expect(new Set(mathematicsFoundationRecords.map(r=>r.title)).size).toBe(21); });
  it("represents open Ramsey intervals with opposing accepted bounds", () => { for (const [title,lower,upper] of [["Ramsey number R(4,6)","36","40"],["Ramsey number R(5,5)","43","46"]]) { const record=mathematicsFoundationRecords.find(r=>r.title===title)!; expect(record.status).toBe("OPEN"); expect(record.claims.map(c=>[c.relation,c.value])).toEqual([[">=",lower],["<=",upper]]); } });
  it("keeps exact theorems as equality claims", () => { for (const record of mathematicsFoundationRecords.filter(r=>r.status==="PROVEN")) expect(record.claims).toEqual([expect.objectContaining({relation:"=",claimType:"EXACT_VALUE"})]); });
});
