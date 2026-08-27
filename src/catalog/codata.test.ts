import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CODATA_DRAFT_COUNT, codataRegistryNumber, parseCodataAscii } from "./codata";
const source=readFileSync(new URL("../../data/codata-2022.txt",import.meta.url),"utf8");
describe("CODATA 2022 catalog snapshot",()=>{
  it("parses enough distinct source-backed constants for the 200-record target",()=>{const rows=parseCodataAscii(source);expect(rows.length).toBeGreaterThan(300);expect(new Set(rows.map(row=>row.quantity)).size).toBe(rows.length);expect(rows.slice(0,CODATA_DRAFT_COUNT)).toHaveLength(200);});
  it("assigns stable institutional registry numbers",()=>{expect(codataRegistryNumber(0)).toBe("LR-001000");expect(codataRegistryNumber(199)).toBe("LR-001199");});
  it("preserves value, uncertainty, and unit",()=>{const row=parseCodataAscii(source).find(item=>item.quantity==="alpha particle mass");expect(row).toEqual({quantity:"alpha particle mass",value:"6.644 657 3450 e-27",uncertainty:"0.000 000 0021 e-27",unit:"kg"});});
});
