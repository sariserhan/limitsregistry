export type MiplibSolution = { instance: string; status: "opt" | "best" | "inf" | "unbd" | "unkn"; objective: string | null };
export type MiplibProvenRecord = { instance: string; objective: string };
export const MIPLIB_SOLUTION_URL = "https://miplib.zib.de/downloads/miplib2017-v36.solu";
export const MIPLIB_BENCHMARK_URL = "https://miplib.zib.de/downloads/benchmark-v2.test";
export const MIPLIB_PAPER_URL = "https://doi.org/10.1007/s12532-020-00194-3";
export const MIPLIB_RELEASE_DATE = new Date("2026-01-26T00:00:00Z");

export function parseMiplibSolutions(input: string): MiplibSolution[] {
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const match = line.match(/^=(opt|best|inf|unbd|unkn)=\s+(\S+)(?:\s+(.+))?$/);
    if (!match) throw new Error(`Malformed MIPLIB solution row: ${line}`);
    return { status: match[1] as MiplibSolution["status"], instance: match[2], objective: match[3]?.trim() ?? null };
  });
}

export function parseMiplibBenchmark(input: string) {
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((filename) => filename.replace(/\.mps\.gz$/, ""));
}

export function provenMiplibBenchmark(solutionInput: string, benchmarkInput: string): MiplibProvenRecord[] {
  const solutions = new Map(parseMiplibSolutions(solutionInput).filter((row) => row.status === "opt" && row.objective !== null).map((row) => [row.instance, row.objective!]));
  return parseMiplibBenchmark(benchmarkInput).flatMap((instance) => { const objective = solutions.get(instance); return objective === undefined ? [] : [{ instance, objective }]; });
}

export function miplibRegistryNumber(index: number) { return `LR-${String(2000 + index).padStart(6, "0")}`; }
export function miplibSlug(instance: string) { return `miplib-2017-${instance.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`; }
export function miplibInstanceUrl(instance: string) { return `https://miplib.zib.de/instance_details_${encodeURIComponent(instance)}.html`; }
