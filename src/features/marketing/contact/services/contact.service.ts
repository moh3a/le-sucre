import "server-only";

import type { z } from "zod";
import type { contact_form_dto } from "../models/contact.dto";
import { contact_repository } from "../repositories/contact.repository";

class ContactService {
  async submit(input: z.infer<typeof contact_form_dto>, ip_hash?: string) {
    await contact_repository.insert({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      locale: input.locale,
      ip_hash,
    });
  }
}

export const contact_service = new ContactService();
