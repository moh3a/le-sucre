import { AppError } from "@/lib/error_handling";

export type MultilingualMessage = {
  fr: string;
  en: string;
  ar: string;
};

export type ErrorDef = {
  code: string;
  status: number;
  message: MultilingualMessage;
};

export function throw_error(def: ErrorDef, details?: Record<string, unknown>): never {
  throw new AppError(def.message.fr, def.code, def.status, { ...details, _messages: def.message }, true);
}

export function extract_messages(details: Record<string, unknown> | null): MultilingualMessage | null {
  if (details && typeof details._messages === "object" && details._messages !== null) {
    const m = details._messages as Record<string, unknown>;
    if (typeof m.fr === "string" && typeof m.en === "string" && typeof m.ar === "string") {
      return m as MultilingualMessage;
    }
  }
  return null;
}
