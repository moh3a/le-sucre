export function compute_line_capture_amount(
  unit_price: string,
  qty: number,
  deposit_percent: number,
) {
  const gross = Number(unit_price) * qty;
  return (gross * (deposit_percent / 100)).toFixed(2);
}
