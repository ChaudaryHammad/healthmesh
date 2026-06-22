import type { BrokenLinkFinding } from "./types";

export class ScanCancelledError extends Error {
  findings: BrokenLinkFinding[];

  constructor(findings: BrokenLinkFinding[] = []) {
    super("Scan halted by user");
    this.name = "ScanCancelledError";
    this.findings = findings;
  }
}
