export type LineItem = { sku: string; unitPriceCents: number; quantity: number };

/** Total in cents for a cart. Quantities must be positive integers. */
export function cartTotal(items: LineItem[]): number {
  let total = 0;
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`invalid quantity for ${item.sku}`);
    }
    total += item.unitPriceCents * item.quantity;
  }
  return total;
}

/** Formats cents as a dollar string, e.g. 1234 -> "$12.34". */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Applies a percent discount to a total in cents, rounding half up. */
export function applyDiscount(totalCents: number, percent: number): number {
  if (!(percent >= 0 && percent <= 100)) {
    throw new Error(`invalid discount percent: ${percent}`);
  }
  return Math.round((totalCents * (100 - percent)) / 100);
}
