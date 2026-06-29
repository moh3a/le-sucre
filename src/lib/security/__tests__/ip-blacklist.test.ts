import { describe, it, expect } from "vitest";
import { extract_client_ip } from "@/lib/security/ip-blacklist";

describe("extract_client_ip", () => {
  it("extracts IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(extract_client_ip(headers)).toBe("1.2.3.4");
  });

  it("extracts IP from x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "1.2.3.4" });
    expect(extract_client_ip(headers)).toBe("1.2.3.4");
  });

  it("extracts IP from cf-connecting-ip", () => {
    const headers = new Headers({ "cf-connecting-ip": "1.2.3.4" });
    expect(extract_client_ip(headers)).toBe("1.2.3.4");
  });

  it("returns unknown when no IP header present", () => {
    const headers = new Headers();
    expect(extract_client_ip(headers)).toBe("unknown");
  });

  it("prioritizes x-forwarded-for over other headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.1.1.1",
      "x-real-ip": "2.2.2.2",
      "cf-connecting-ip": "3.3.3.3",
    });
    expect(extract_client_ip(headers)).toBe("1.1.1.1");
  });

  it("handles Request objects", () => {
    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(extract_client_ip(req)).toBe("10.0.0.1");
  });
});
