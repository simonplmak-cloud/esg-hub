import { describe, it, expect } from "vitest";
import { preflightDbWriteAccess } from "../../../scripts/lib/preflight-iam.mjs";

const okQ = async () => `[{ "tables": { "lease": "DEFINE TABLE lease", "page": "DEFINE TABLE page" } }]`;

const deniedQ = async () => {
  throw new Error("I am not authorized to perform this operation");
};

const viewerQ = async () => `[]`;

describe("preflightDbWriteAccess", () => {
  it("passes when the DB user sees the required schema", async () => {
    const res = await preflightDbWriteAccess(okQ);
    expect(res.ok).toBe(true);
    expect(res.tables).toContain("lease");
  });

  it("fails fast when the DB user is denied", async () => {
    const res = await preflightDbWriteAccess(deniedQ);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Editor\/Owner/);
  });

  it("fails when required tables are not visible (Viewer-only)", async () => {
    const res = await preflightDbWriteAccess(viewerQ);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Viewer-only/);
  });
});
