import { describe, expect, test } from "bun:test";
import { cartTotal, clear, formatCents } from "./cart";

describe("cartTotal", () => {
  test("sums line items", () => {
    expect(cartTotal([{ sku: "a", unitPriceCents: 250, quantity: 2 }, { sku: "b", unitPriceCents: 100, quantity: 1 }])).toBe(600);
  });
  test("rejects a zero quantity", () => {
    expect(() => cartTotal([{ sku: "a", unitPriceCents: 1, quantity: 0 }])).toThrow("invalid quantity for a");
  });
});

describe("formatCents", () => {
  test("formats dollars and cents", () => {
    expect(formatCents(1234)).toBe("$12.34");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(-250)).toBe("-$2.50");
  });
});

describe("clear", () => {
  test("empties a cart and reports the count", () => {
    const items = [{ sku: "a", unitPriceCents: 250, quantity: 2 }, { sku: "b", unitPriceCents: 100, quantity: 1 }];
    const result = clear(items);
    expect(result.items).toEqual([]);
    expect(result.removed).toBe(2);
    expect(items.length).toBe(2);
  });
  test("clearing an empty cart returns 0", () => {
    const result = clear([]);
    expect(result.items).toEqual([]);
    expect(result.removed).toBe(0);
  });
});
