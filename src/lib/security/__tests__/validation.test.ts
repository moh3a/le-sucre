import { describe, it, expect } from "vitest";
import { validate_file_upload, validate_search_query } from "../validation";

describe("validate_file_upload", () => {
  it("accepts valid image files", () => {
    expect(() => validate_file_upload("image.jpg", "image/jpeg", 1024 * 1024)).not.toThrow();
    expect(() => validate_file_upload("photo.png", "image/png", 500 * 1024)).not.toThrow();
  });

  it("rejects executable files", () => {
    expect(() => validate_file_upload("virus.exe", "application/x-msdownload", 100)).toThrow();
    expect(() => validate_file_upload("script.sh", "application/x-sh", 100)).toThrow();
  });

  it("rejects oversized files", () => {
    expect(() => validate_file_upload("huge.jpg", "image/jpeg", 200 * 1024 * 1024)).toThrow();
  });

  it("rejects unknown extensions", () => {
    expect(() => validate_file_upload("file.xyz", "application/octet-stream", 100)).toThrow();
  });
});

describe("validate_search_query", () => {
  it("cleans dangerous characters", () => {
    expect(validate_search_query("hello; DROP TABLE")).toBe("hello DROP TABLE");
  });

  it("rejects too short queries", () => {
    expect(() => validate_search_query("a")).toThrow("too short");
  });

  it("rejects too long queries", () => {
    const long = "a".repeat(300);
    expect(() => validate_search_query(long)).toThrow("too long");
  });

  it("accepts valid queries", () => {
    expect(validate_search_query("laptop gaming")).toBe("laptop gaming");
  });
});
