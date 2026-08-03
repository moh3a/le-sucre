import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export type ServerFieldErrors = {
  fieldErrors?: Record<string, string[]>;
};

export function apply_server_field_errors<T extends FieldValues>(
  form: UseFormReturn<T>,
  data: ServerFieldErrors | undefined,
): boolean {
  const entries = Object.entries(data?.fieldErrors ?? {});
  if (!entries.length) return false;

  for (const [field, messages] of entries) {
    if (field in form.getValues()) {
      form.setError(field as FieldPath<T>, {
        type: "server",
        message: messages?.[0] ?? undefined,
      });
    }
  }
  return true;
}
