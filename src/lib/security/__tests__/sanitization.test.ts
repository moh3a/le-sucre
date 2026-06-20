import { describe, it, expect } from "vitest";
import {
  sanitize_html,
  sanitize_plain_text,
  sanitize_filename,
  sanitize_search_input,
  sanitize_json,
} from "../sanitization";

describe("sanitize_html", () => {
  it("removes script tags", () => {
    expect(sanitize_html("<script>alert('xss')</script>")).toBe("");
  });

  it("allows safe HTML tags", () => {
    expect(sanitize_html("<b>bold</b>")).toBe("<b>bold</b>");
    expect(sanitize_html("<p>paragraph</p>")).toBe("<p>paragraph</p>");
  });

  it("removes unsafe attributes like onclick", () => {
    const result = sanitize_html('<a href="#" onclick="alert(1)">link</a>');
    expect(result).not.toContain("onclick");
  });

  it("blocks javascript: URLs", () => {
    const result = sanitize_html('<a href="javascript:alert(1)">link</a>');
    expect(result).toContain("#blocked");
  });

  it("allows safe attributes", () => {
    expect(sanitize_html('<a href="/safe">link</a>')).toContain('href="/safe"');
  });
});

describe("sanitize_plain_text", () => {
  it("escapes HTML entities", () => {
    expect(sanitize_plain_text("<script>alert(1)</script>"))
      .toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes quotes", () => {
    expect(sanitize_plain_text('he"llo')).toBe("he&quot;llo");
  });
});

describe("sanitize_filename", () => {
  it("removes dangerous characters", () => {
    expect(sanitize_filename("test<script>.exe")).toBe("test_script_.exe");
  });

  it("prevents path traversal", () => {
    expect(sanitize_filename("../../etc/passwd")).toBe("..__etc_passwd");
  });

  it("limits length", () => {
    const long = "a".repeat(300);
    expect(sanitize_filename(long).length).toBeLessThanOrEqual(255);
  });
});

describe("sanitize_search_input", () => {
  it("removes SQL injection characters", () => {
    expect(sanitize_search_input("1; DROP TABLE products")).toBe("1 DROP TABLE products");
  });

  it("limits length", () => {
    const long = "a".repeat(300);
    expect(sanitize_search_input(long).length).toBeLessThanOrEqual(200);
  });
});
