import { z } from "zod";

export const contact_form_dto = z.object({
  name: z.string().min(1, "Veuillez saisir votre nom").max(255),
  email: z.string().min(1, "Veuillez saisir votre email").email("Email invalide").max(255),
  subject: z.string().min(1, "Veuillez saisir un sujet").max(255),
  message: z.string().min(10, "Votre message doit contenir au moins 10 caractères").max(5000),
  locale: z.string().max(5).default("fr"),
});
