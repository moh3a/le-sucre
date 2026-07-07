import "server-only";

import { db } from "@/lib/db";
import { contact_messages } from "../db/schema";

class ContactRepository {
  async insert(input: typeof contact_messages.$inferInsert) {
    const [created] = await db.insert(contact_messages).values(input);
    return created;
  }
}

export const contact_repository = new ContactRepository();
