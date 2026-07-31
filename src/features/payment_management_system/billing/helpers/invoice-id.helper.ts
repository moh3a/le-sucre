import "server-only";
import { build_sequence_number } from "@/lib/sequences";

type InvoiceDocumentType = "INV" | "REF" | "CN";

const SEQUENCE_CONFIG: Record<InvoiceDocumentType, { letter: string }> = {
  INV: { letter: "I" },
  REF: { letter: "R" },
  CN: { letter: "CR" },
};

/**
 * Generates an invoice id in the format `<prefix>-<MMYY><letter><serial>`,
 * e.g. `I-0726I0001` using an atomic Redis increment.
 * Invoice documents all share the `I` prefix and are differentiated by the
 * letter segment: I (invoice), R (refund invoice), CR (credit note).
 */
export async function build_invoice_id(type: InvoiceDocumentType): Promise<string> {
  return build_sequence_number({
    namespace: "invoice",
    prefix: "I",
    letter: SEQUENCE_CONFIG[type].letter,
  });
}
