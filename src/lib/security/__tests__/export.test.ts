import { describe, it, expect } from "vitest";
import { sanitize_csv_value, prevent_csv_injection, sanitize_export_filename } from "../export";

describe("sanitize_csv_value", () => {
  it("prevents formula injection", () => {
    expect(sanitize_csv_value("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitize_csv_value("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(sanitize_csv_value("-1+1")).toBe("'-1+1");
    expect(sanitize_csv_value("@DATEDIF")).toBe("'@DATEDIF");
  });

  it("wraps values with commas in quotes", () => {
    expect(sanitize_csv_value("hello, world")).toBe('"hello, world"');
  });

  it("escapes double quotes", () => {
    expect(sanitize_csv_value('say "hello"')).toBe('"say ""hello"""');
  });

  it("passes through safe values", () => {
    expect(sanitize_csv_value("simple")).toBe("simple");
    expect(sanitize_csv_value("123")).toBe("123");
  });
});

describe("prevent_csv_injection", () => {
  it("sanitizes all rows", () => {
    const data = [
      ["name", "email", "notes"],
      ["John", "john@test.com", "=DANGER"],
    ];
    const result = prevent_csv_injection(data);
    expect(result[1][2]).toBe("'=DANGER");
  });
});

describe("sanitize_export_filename", () => {
  it("removes path traversal", () => {
    expect(sanitize_export_filename("../../etc/passwd")).toBe("__etc_passwd");
  });
});
