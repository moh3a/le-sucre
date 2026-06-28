import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { user_profiles, user_addresses } from "@/features/authentication_and_authorization/profile/db/schema";

export type UserProfile = InferSelectModel<typeof user_profiles>;
export type UserProfileInsert = InferInsertModel<typeof user_profiles>;

export type UserAddress = InferSelectModel<typeof user_addresses>;
export type UserAddressInsert = InferInsertModel<typeof user_addresses>;

export type AddressType = "shipping" | "billing" | "both";
export type Gender = "male" | "female" | "other";
