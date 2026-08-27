import { describe, expect, it } from "vitest";
import { adaptVerifierExecution, ARTIFACT_VERIFIERS } from "./artifact-adapters";
describe("formal verification adapters", () => {
  it.each([
    ["LEAN4", "lake build", "Lean 4.19.0", ""],
    ["COQ", "dune build", "Coq 8.20", ""],
    ["ISABELLE", "isabelle build -D .", "Isabelle2025", ""],
    ["SAT_SOLVER", "drat-trim proof.cnf proof.drat", "drat-trim 2.2", "s VERIFIED\n"],
  ] as const)("adapts a successful %s run", (verifier, command, toolVersion, stdout) => expect(adaptVerifierExecution({ verifier, command, toolVersion, stdout, exitCode: 0 })).toMatchObject({ status: "PASSED", reproducible: true }));
  it("does not accept a failed or unapproved build", () => {
    expect(adaptVerifierExecution({ verifier: "LEAN4", command: "lake build", toolVersion: "4.19", stdout: "", exitCode: 1 }).reproducible).toBe(false);
    expect(adaptVerifierExecution({ verifier: "LEAN4", command: "bash install.sh", toolVersion: "4.19", stdout: "", exitCode: 0 }).status).toBe("REJECTED");
  });
  it("does not accept a SAT run without a verified sentinel", () => expect(adaptVerifierExecution({ verifier: "SAT_SOLVER", command: "drat-trim a b", toolVersion: "2.2", stdout: "s INVALID", exitCode: 0 }).status).toBe("FAILED"));
  it("covers every supported verifier", () => expect(ARTIFACT_VERIFIERS).toHaveLength(4));
});
