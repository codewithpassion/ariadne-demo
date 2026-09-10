import { describe, expect, test } from "bun:test";
import { cartTotal, formatCents, total } from "./cart";

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

describe("total", () => {
  test("an empty cart is zero", () => {
    expect(total([])).toBe(0);
  });
  test("a single line item", () => {
    expect(total([{ sku: "a", unitPriceCents: 250, quantity: 2 }])).toBe(500);
  });
  test("several line items", () => {
    expect(total([{ sku: "a", unitPriceCents: 250, quantity: 2 }, { sku: "b", unitPriceCents: 100, quantity: 1 }])).toBe(600);
  });
});
