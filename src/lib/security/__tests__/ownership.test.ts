import { describe, it, expect } from "vitest";
import { OwnershipService } from "../ownership";

describe("OwnershipService", () => {
  const svc = new OwnershipService();

  describe("assert_owner", () => {
    it("passes when user owns resource", () => {
      expect(() => svc.assert_owner("user1", "user1", "order")).not.toThrow();
    });

    it("throws when user does not own resource", () => {
      expect(() => svc.assert_owner("user1", "user2", "order")).toThrow("You do not own this order");
    });
  });

  describe("assert_access", () => {
    it("allows owner access", () => {
      expect(() => svc.assert_access("user1", "user1", ["customer"], ["admin"], "resource")).not.toThrow();
    });

    it("allows admin access", () => {
      expect(() => svc.assert_access("user1", "admin1", ["admin"], ["admin"], "resource")).not.toThrow();
    });

    it("denies non-owner non-admin access", () => {
      expect(() => svc.assert_access("user1", "user2", ["customer"], ["admin"], "resource")).toThrow();
    });
  });

  describe("assert_operator_access", () => {
    it("allows admin always", () => {
      expect(() => svc.assert_operator_access("operator1", "admin", ["admin"])).not.toThrow();
    });

    it("allows assigned operator", () => {
      expect(() => svc.assert_operator_access("op1", "op1", ["operator"])).not.toThrow();
    });

    it("denies unassigned operator", () => {
      expect(() => svc.assert_operator_access("op1", "op2", ["operator"])).toThrow();
    });
  });
});
