import { describe, it, expect } from "vitest";
import { buildSlugMap, expandLabels, isRelevant } from "../../../scripts/lib/eval-resolver.mjs";

const pageIndex = [
  { id: "page:20zz0z0bjewxrohgzzjb", permalink: "/environmental/climate-change", slug: "climate-change" },
  { id: "page:ab12cd34ef56gh78ij90kl", permalink: "/standards/tcfd", slug: "tcfd" },
  { id: "page:ff112233445566778899aa", permalink: "/standards/gri-305", slug: "gri-305" },
];

describe("eval label resolver", () => {
  it("builds a slug -> {id, permalink} map", () => {
    const map = buildSlugMap(pageIndex);
    expect(map.get("climate-change")).toEqual({
      id: "page:20zz0z0bjewxrohgzzjb",
      permalink: "/environmental/climate-change",
    });
    expect(map.size).toBe(3);
  });

  it("expands slug labels into record id + permalink match keys", () => {
    const map = buildSlugMap(pageIndex);
    const keys = expandLabels(["page:climate-change", "page:tcfd"], map);
    expect(keys).toEqual(
      new Set([
        "page:20zz0z0bjewxrohgzzjb",
        "/environmental/climate-change",
        "page:ab12cd34ef56gh78ij90kl",
        "/standards/tcfd",
      ])
    );
  });

  it("keeps unknown labels as-is for exact matching", () => {
    const map = buildSlugMap(pageIndex);
    const keys = expandLabels(["page:does-not-exist"], map);
    expect(keys.has("page:does-not-exist")).toBe(true);
  });

  it("judges a result relevant by record id", () => {
    const map = buildSlugMap(pageIndex);
    const keys = expandLabels(["page:climate-change"], map);
    expect(isRelevant({ id: "page:20zz0z0bjewxrohgzzjb", permalink: "/x" }, keys)).toBe(1);
  });

  it("judges a result relevant by permalink", () => {
    const map = buildSlugMap(pageIndex);
    const keys = expandLabels(["page:gri-305"], map);
    expect(isRelevant({ id: "page:zzz", permalink: "/standards/gri-305" }, keys)).toBe(1);
  });

  it("returns 0 for a non-matching result", () => {
    const map = buildSlugMap(pageIndex);
    const keys = expandLabels(["page:climate-change"], map);
    expect(isRelevant({ id: "page:zzz", permalink: "/standards/tcfd" }, keys)).toBe(0);
  });
});
