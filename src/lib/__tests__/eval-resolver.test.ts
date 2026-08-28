import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchPageIndex, buildSlugMap, expandLabels, isRelevant, dcg, idcg, mrr } from "../../../scripts/lib/eval-resolver.mjs";

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

describe("fetchPageIndex", () => {
  const pagesBody = (items: Array<{ id: string; permalink: string; slug: string }>, hasMore: boolean) => ({
    data: items,
    pagination: { total: items.length, limit: 100, offset: 0, has_more: hasMore },
  });

  afterEach(() => vi.restoreAllMocks());

  it("reads the page index from body.data (the /api/v1/pages response key)", async () => {
    const body = pagesBody([{ id: "page:abc", permalink: "/about", slug: "about" }], false);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    const index = await fetchPageIndex("https://example.com");
    expect(index).toEqual([{ id: "page:abc", permalink: "/about", slug: "about" }]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/pages?limit=100&offset=0"),
      expect.any(Object),
    );
  });

  it("paginates while pagination.has_more is true", async () => {
    const first = pagesBody([{ id: "page:a", permalink: "/a", slug: "a" }], true);
    const second = pagesBody([{ id: "page:b", permalink: "/b", slug: "b" }], false);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => first })
        .mockResolvedValueOnce({ ok: true, json: async () => second })
    );
    const index = await fetchPageIndex("https://example.com", { limit: 1 });
    expect(index.map((p) => p.id)).toEqual(["page:a", "page:b"]);
  });

  it("stops when the API returns fewer items than the page size", async () => {
    const body = pagesBody([], false);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    const index = await fetchPageIndex("https://example.com");
    expect(index).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "boom" }));
    await expect(fetchPageIndex("https://example.com")).rejects.toThrow("Pages API returned 500");
  });
});

describe("nDCG/MRR scoring", () => {
  const slugMap = new Map([
    ["s1", { id: "page:one", permalink: "/a" }],
    ["s2", { id: "page:two", permalink: "/b" }],
  ]);

  it("idcg counts relevant documents, not expanded match keys", () => {
    const keys = expandLabels(["page:s1"], slugMap);
    expect(keys.size).toBe(2); // id + permalink
    expect(idcg(1, 10)).toBeCloseTo(1 / Math.log2(2), 5);
  });

  it("scores a perfect single-relevant hit at nDCG=1.0", () => {
    const keys = expandLabels(["page:s1"], slugMap);
    const results = [{ id: "page:one", permalink: "/a" }];
    const ndcg = dcg(results, keys, 10) / idcg(1, 10);
    expect(ndcg).toBeCloseTo(1.0, 5);
    expect(mrr(results, keys)).toBeCloseTo(1.0, 5);
  });

  it("scores a two-label query with both relevant results at rank 1-2", () => {
    const keys = expandLabels(["page:s1", "page:s2"], slugMap);
    const results = [
      { id: "page:one", permalink: "/a" },
      { id: "page:two", permalink: "/b" },
    ];
    const dcgScore = dcg(results, keys, 10);
    const idcgScore = idcg(2, 10);
    expect(dcgScore).toBeCloseTo(idcgScore, 5); // perfect ranking
    expect(dcgScore / idcgScore).toBeCloseTo(1.0, 5);
  });

  it("scores zero when no result matches", () => {
    const keys = expandLabels(["page:s1"], slugMap);
    const results = [{ id: "page:zzz", permalink: "/nope" }];
    expect(dcg(results, keys, 10)).toBe(0);
    expect(mrr(results, keys)).toBe(0);
  });
});
