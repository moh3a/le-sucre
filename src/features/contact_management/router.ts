import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { contact_form_dto } from "./models/contact.dto";
import { contact_service } from "./services/contact.service";
import { getClientIp } from "@/lib/rate-limit";

export const contact_router = create_trpc_router({
  submit: public_procedure
    .input(contact_form_dto)
    .mutation(({ ctx, input }) =>
      contact_service.submit(input, getClientIp(ctx.req.headers)),
    ),
});
