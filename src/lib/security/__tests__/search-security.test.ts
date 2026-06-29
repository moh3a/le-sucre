import { describe, it, expect } from "vitest";
import { validate_search_complexity, validate_filter_params } from "../search-security";

describe("validate_search_complexity", () => {
  it("allows normal search queries", () => {
    const result = validate_search_complexity("chocolate cake");
    expect(result.valid).toBe(true);
    expect(result.sanitized_query).toBe("chocolate cake");
  });

  it("rejects SQL injection patterns", () => {
    const result = validate_search_complexity("chocolate' OR '1'='1");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("forbidden patterns");
  });

  it("rejects UNION-based injection", () => {
    const result = validate_search_complexity("chocolate UNION SELECT * FROM users");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("forbidden patterns");
  });

  it("rejects time-based blind injection", () => {
    const result = validate_search_complexity("chocolate SLEEP(5)");
    expect(result.valid).toBe(false);
  });

  it("strips dangerous characters", () => {
    const result = validate_search_complexity("choco<>late");
    expect(result.valid).toBe(true);
    expect(result.sanitized_query).not.toContain("<>");
  });

  it("rejects queries that are too long", () => {
    const long_query = "a".repeat(300);
    const result = validate_search_complexity(long_query);
    expect(result.valid).toBe(false);
  });

  it("rejects queries that are too short", () => {
    const result = validate_search_complexity("a");
    expect(result.valid).toBe(false);
  });

  it("trims whitespace", () => {
    const result = validate_search_complexity("  hello world  ");
    expect(result.sanitized_query).toBe("hello world");
  });

  it("rejects too many wildcards", () => {
    const result = validate_search_complexity("a*b*c*d*e*f*g");
    expect(result.valid).toBe(false);
  });

  it("rejects LOAD_FILE injection", () => {
    const result = validate_search_complexity("LOAD_FILE('/etc/passwd')");
    expect(result.valid).toBe(false);
  });
});

describe("validate_filter_params", () => {
  it("allows normal filter params", () => {
    const result = validate_filter_params({ category: "chocolate", price: "10-20" });
    expect(result.valid).toBe(true);
  });

  it("sanitizes filter values", () => {
    const result = validate_filter_params({ q: "<script>alert(1)</script>" });
    expect(result.valid).toBe(true);
    expect(result.sanitized.q).not.toContain("<script>");
  });

  it("rejects too many filters", () => {
    const filters: Record<string, string> = {};
    for (let i = 0; i < 25; i++) {
      filters[`filter_${i}`] = "value";
    }
    const result = validate_filter_params(filters);
    expect(result.valid).toBe(false);
  });
});
