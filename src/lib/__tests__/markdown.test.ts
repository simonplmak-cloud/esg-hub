/**
 * Unit tests for markdown utility functions
 * Tests extractHeadings, generateId, and getFirstParagraph
 *
 * Run tests with: `npx vitest run src/lib/__tests__/markdown.test.ts`
 */

import { describe, it, expect } from "vitest";
import { extractHeadings, generateId, getFirstParagraph } from "../markdown";

describe("extractHeadings", () => {
  it("should extract h2 headings from markdown", () => {
    const markdown = `
# Title
## Overview
Some content here
## Key Concepts
More content
`;
    const result = extractHeadings(markdown);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ level: 2, text: "Overview", id: "overview" });
    expect(result[1]).toEqual({ level: 2, text: "Key Concepts", id: "key-concepts" });
  });

  it("should extract h3 headings from markdown", () => {
    const markdown = `
## Section
### Subsection A
### Subsection B
`;
    const result = extractHeadings(markdown);
    
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ level: 3, text: "Subsection A", id: "subsection-a" });
    expect(result[2]).toEqual({ level: 3, text: "Subsection B", id: "subsection-b" });
  });

  it("should not extract h1 headings", () => {
    const markdown = `
# Title
## Section 1
# Another Title
## Section 2
`;
    const result = extractHeadings(markdown);
    
    expect(result).toHaveLength(2);
    expect(result.every(h => h.level >= 2)).toBe(true);
  });

  it("should sanitize text for IDs by removing special characters", () => {
    const markdown = `
## What's New?
## C++ Programming
## 100% Coverage
`;
    const result = extractHeadings(markdown);
    
    expect(result[0].id).toBe("whats-new");
    expect(result[1].id).toBe("c-programming");
    expect(result[2].id).toBe("100-coverage");
  });

  it("should handle markdown formatting in headings", () => {
    const markdown = `
## *Italic* and **Bold**
## \`code\` example
`;
    const result = extractHeadings(markdown);
    
    expect(result[0].text).toBe("Italic and Bold");
    expect(result[1].text).toBe("code example");
  });

  it("should handle links in headings", () => {
    const markdown = `
## [Link Text](http://example.com)
`;
    const result = extractHeadings(markdown);
    
    expect(result[0].text).toBe("Link Text");
    expect(result[0].id).toBe("link-text");
  });

  it("should return empty array for markdown with no headings", () => {
    const markdown = `
This is just plain text.
No headings here.
`;
    const result = extractHeadings(markdown);
    
    expect(result).toEqual([]);
  });

  it("should handle multiple consecutive headings", () => {
    const markdown = `
## First
## Second
## Third
`;
    const result = extractHeadings(markdown);
    
    expect(result).toHaveLength(3);
    expect(result.map(h => h.id)).toEqual(["first", "second", "third"]);
  });

  it("should collapse multiple dashes in IDs", () => {
    const markdown = `
## Hello   World
## Test--Case
`;
    const result = extractHeadings(markdown);
    
    expect(result[0].id).toBe("hello-world");
    expect(result[1].id).toBe("test-case");
  });

  it("should preserve numbers in IDs", () => {
    const markdown = `
## Step 1: Introduction
## Phase 2 Implementation
`;
    const result = extractHeadings(markdown);
    
    expect(result[0].id).toBe("step-1-introduction");
    expect(result[1].id).toBe("phase-2-implementation");
  });
});

describe("generateId", () => {
  it("should convert text to lowercase", () => {
    expect(generateId("Hello World")).toBe("hello-world");
  });

  it("should replace spaces with dashes", () => {
    expect(generateId("Hello World Test")).toBe("hello-world-test");
  });

  it("should remove special characters", () => {
    expect(generateId("Hello@World#Test")).toBe("helloworldtest");
  });

  it("should collapse multiple dashes", () => {
    expect(generateId("Hello   World")).toBe("hello-world");
  });

  it("should handle empty string", () => {
    expect(generateId("")).toBe("");
  });

  it("should handle strings with only special characters", () => {
    expect(generateId("!@#$%")).toBe("");
  });

  it("should preserve numbers", () => {
    expect(generateId("Step 1 of 5")).toBe("step-1-of-5");
  });
});

describe("getFirstParagraph", () => {
  it("should return first non-empty line", () => {
    const markdown = `
First paragraph here.
Second paragraph.
`;
    expect(getFirstParagraph(markdown)).toBe("First paragraph here.");
  });

  it("should skip headings", () => {
    const markdown = `
# Title
First paragraph here.
`;
    expect(getFirstParagraph(markdown)).toBe("First paragraph here.");
  });

  it("should skip list items", () => {
    const markdown = `
- Item 1
- Item 2
First paragraph here.
`;
    expect(getFirstParagraph(markdown)).toBe("First paragraph here.");
  });

  it("should return empty string for empty content", () => {
    expect(getFirstParagraph("")).toBe("");
  });

  it("should return empty string for content with only headings", () => {
    const markdown = `
# Title
## Section
`;
    expect(getFirstParagraph(markdown)).toBe("");
  });

  it("should handle content starting with whitespace", () => {
    const markdown = `
   
First paragraph here.
`;
    expect(getFirstParagraph(markdown)).toBe("First paragraph here.");
  });
});
