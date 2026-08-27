export type CodataConstant = { quantity: string; value: string; uncertainty: string; unit: string };
export const CODATA_SOURCE_URL = "https://physics.nist.gov/cuu/Constants/Table/allascii.txt";
export const CODATA_CITATION_URL = "https://www.nist.gov/publications/codata-recommended-values-fundamental-physical-constants-2022";
export const CODATA_DRAFT_COUNT = 200;

export function parseCodataAscii(input: string): CodataConstant[] {
  const divider = input.split(/\r?\n/).findIndex((line) => /^-{20,}$/.test(line.trim()));
  if (divider < 0) throw new Error("CODATA table divider was not found.");
  return input.split(/\r?\n/).slice(divider + 1).map((line) => line.trim()).filter(Boolean).map((line) => {
    const fields = line.split(/\s{2,}/);
    if (fields.length < 3) throw new Error(`Malformed CODATA row: ${line}`);
    const [quantity, value, uncertainty, unit = ""] = fields;
    return { quantity, value, uncertainty, unit };
  });
}

export function codataRegistryNumber(index: number) { return `LR-${String(1000 + index).padStart(6, "0")}`; }
export function codataSlug(quantity: string, index: number) { const base=quantity.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); return `codata-${base || index + 1}`; }
