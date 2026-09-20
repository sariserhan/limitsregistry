import { describe, expect, it } from "vitest";
import { mathematicsFoundationRecords } from "./mathematics-foundations";
describe("mathematics foundation catalog", () => {
  it("covers all 25 requested records without duplicate titles", () => { expect(mathematicsFoundationRecords).toHaveLength(25); expect(new Set(mathematicsFoundationRecords.map(r=>r.title)).size).toBe(25); });
  it("represents open Ramsey intervals with opposing accepted bounds", () => { for (const [title,lower,upper] of [["Ramsey number R(4,6)","36","40"],["Ramsey number R(5,5)","43","46"],["Ramsey number R(3,10)","40","41"],["Ramsey number R(4,7)","49","58"],["Ramsey number R(5,6)","58","85"]]) { const record=mathematicsFoundationRecords.find(r=>r.title===title)!; expect(record.status).toBe("OPEN"); expect(record.claims.map(c=>[c.relation,c.value])).toEqual([[">=",lower],["<=",upper]]); } });
  it("keeps exact theorems as equality claims", () => { for (const record of mathematicsFoundationRecords.filter(r=>r.status==="PROVEN")) expect(record.claims).toEqual([expect.objectContaining({relation:"=",claimType:"EXACT_VALUE"})]); });
});
