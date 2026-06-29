import { describe, it, expect } from "vitest";
import { ownership_service } from "@/lib/security/ownership";

describe("OwnershipService", () => {
  describe("assert_owner", () => {
    it("allows when user IDs match", () => {
      expect(() =>
        ownership_service.assert_owner("user_1", "user_1", "order"),
      ).not.toThrow();
    });

    it("throws when user IDs do not match", () => {
      expect(() =>
        ownership_service.assert_owner("user_1", "user_2", "order"),
      ).toThrow("You do not own this order");
    });
  });

  describe("assert_access", () => {
    it("allows owner access", () => {
      expect(() =>
        ownership_service.assert_access("user_1", "user_1", ["customer"], ["admin", "moderator"]),
      ).not.toThrow();
    });

    it("allows admin access", () => {
      expect(() =>
        ownership_service.assert_access("user_1", "admin_1", ["admin"], ["admin", "moderator"]),
      ).not.toThrow();
    });

    it("denies non-owner non-admin access", () => {
      expect(() =>
        ownership_service.assert_access("user_1", "user_3", ["customer"], ["admin", "moderator"]),
      ).toThrow("Access denied to resource");
    });
  });

  describe("assert_operator_access", () => {
    it("allows admin access", () => {
      expect(() =>
        ownership_service.assert_operator_access("op_1", "admin_1", ["admin"]),
      ).not.toThrow();
    });

    it("allows moderator access", () => {
      expect(() =>
        ownership_service.assert_operator_access("op_1", "mod_1", ["moderator"]),
      ).not.toThrow();
    });

    it("allows assigned operator access", () => {
      expect(() =>
        ownership_service.assert_operator_access("op_1", "op_1", ["operator"]),
      ).not.toThrow();
    });

    it("denies unassigned operator access", () => {
      expect(() =>
        ownership_service.assert_operator_access("op_1", "op_2", ["operator"]),
      ).toThrow("You can only access orders assigned to you");
    });
  });
});
