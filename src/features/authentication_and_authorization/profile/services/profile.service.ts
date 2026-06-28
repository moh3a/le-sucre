import "server-only";

import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { PROFILE_ERROR } from "@/features/authentication_and_authorization/profile/constants/error-codes";
import { profile_repository } from "@/features/authentication_and_authorization/profile/repositories/profile.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import type { UserProfileInsert, UserAddressInsert } from "@/features/authentication_and_authorization/profile/types";

const ADDRESS_LIMIT = 10;

export class ProfileService {
  async get_profile(user_id: string) {
    const profile = await profile_repository.find_by_user_id(user_id);
    const addresses = await profile_repository.find_addresses_by_user_id(user_id);
    return { profile, addresses };
  }

  async initialize_profile(user_id: string, data: { first_name: string; last_name: string }) {
    const profile = await profile_repository.upsert(user_id, {
      first_name: data.first_name,
      last_name: data.last_name,
    });

    await audit_service.log({
      actor_user_id: user_id,
      action: "profile.initialized",
      resource_type: "user_profile",
      resource_id: profile.id,
    });

    return profile;
  }

  async update_profile(user_id: string, data: Partial<UserProfileInsert>) {
    const profile = await profile_repository.upsert(user_id, data);

    await audit_service.log({
      actor_user_id: user_id,
      action: "profile.updated",
      resource_type: "user_profile",
      resource_id: profile.id,
      metadata: { updated_fields: Object.keys(data) },
    });

    return profile;
  }

  async create_address(user_id: string, data: UserAddressInsert) {
    const count = await profile_repository.count_addresses(user_id);
    if (count >= ADDRESS_LIMIT) {
      throw_error(PROFILE_ERROR.ADDRESS_LIMIT_REACHED);
    }

    const address = await profile_repository.create_address(user_id, data);

    // If this is the first address, set it as default in profile
    if (count === 0) {
      await profile_repository.set_default_address(user_id, address.id, "shipping");
      await profile_repository.set_default_address(user_id, address.id, "billing");
    }

    await audit_service.log({
      actor_user_id: user_id,
      action: "address.created",
      resource_type: "user_address",
      resource_id: address.id,
      metadata: { label: data.label },
    });

    return address;
  }

  async update_address(user_id: string, address_id: string, data: Partial<UserAddressInsert>) {
    const updated = await profile_repository.update_address(address_id, user_id, data);
    if (!updated) {
      throw_error(PROFILE_ERROR.ADDRESS_NOT_FOUND);
    }

    await audit_service.log({
      actor_user_id: user_id,
      action: "address.updated",
      resource_type: "user_address",
      resource_id: address_id,
      metadata: { updated_fields: Object.keys(data) },
    });

    return updated;
  }

  async delete_address(user_id: string, address_id: string) {
    const deleted = await profile_repository.delete_address(address_id, user_id);
    if (!deleted) {
      throw_error(PROFILE_ERROR.ADDRESS_NOT_FOUND);
    }

    await audit_service.log({
      actor_user_id: user_id,
      action: "address.deleted",
      resource_type: "user_address",
      resource_id: address_id,
    });

    return { ok: true };
  }

  async set_default_address(user_id: string, address_id: string, type: "shipping" | "billing") {
    const address = await profile_repository.set_default_address(user_id, address_id, type);
    if (!address) {
      throw_error(PROFILE_ERROR.ADDRESS_NOT_FOUND);
    }

    await audit_service.log({
      actor_user_id: user_id,
      action: "address.set_default",
      resource_type: "user_address",
      resource_id: address_id,
      metadata: { type },
    });

    return address;
  }
}

export const profile_service = new ProfileService();
