export const ARTIFACT_VERIFIERS = ["LEAN4", "COQ", "ISABELLE", "SAT_SOLVER"] as const;
export type ArtifactVerifier = (typeof ARTIFACT_VERIFIERS)[number];
export type ExecutionInput = { verifier: ArtifactVerifier; command: string; toolVersion: string; exitCode: number; stdout: string; stderr?: string };
export type AdaptedExecution = { status: "PASSED" | "FAILED" | "REJECTED"; reproducible: boolean; summary: string };

const commandRules: Record<ArtifactVerifier, RegExp> = {
  LEAN4: /^lake build(?: [\w./-]+)*$/,
  COQ: /^(?:dune build|make)(?: [\w./-]+)*$/,
  ISABELLE: /^isabelle build(?: [\w./-]+)*$/,
  SAT_SOLVER: /^(?:drat-trim|gratgen|cake_lpr)(?: [\w./-]+)*$/,
};

export function adaptVerifierExecution(input: ExecutionInput): AdaptedExecution {
  if (!input.toolVersion.trim()) return { status: "REJECTED", reproducible: false, summary: "A verifier version is required." };
  if (!commandRules[input.verifier].test(input.command.trim())) return { status: "REJECTED", reproducible: false, summary: "The command is not approved for this verifier." };
  if (!Number.isInteger(input.exitCode)) return { status: "REJECTED", reproducible: false, summary: "An integer exit code is required." };
  if (input.exitCode !== 0) return { status: "FAILED", reproducible: false, summary: `${input.verifier} exited with code ${input.exitCode}.` };
  if (input.verifier === "SAT_SOLVER" && !/(?:^|\n)(?:s )?(?:VERIFIED|VERIFIED UNSAT)(?:\n|$)/i.test(input.stdout)) return { status: "FAILED", reproducible: false, summary: "The SAT checker did not emit a verification sentinel." };
  return { status: "PASSED", reproducible: true, summary: `${input.verifier} completed successfully with the recorded tool version and command.` };
}
