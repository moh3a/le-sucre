export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}

export function format_price(price: number, currency: string = "DZD") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(price);
}

export function format_currency(
  price: number,
  currency: string = "DZD",
  maximumFractionDigits: number = 2,
) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: maximumFractionDigits,
  }).format(price);
}
