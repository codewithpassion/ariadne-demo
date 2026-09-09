import { describe, expect, test } from "bun:test";
import { applyDiscount, cartTotal, formatCents } from "./cart";

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

describe("applyDiscount", () => {
  test("discounts a total", () => {
    expect(applyDiscount(1000, 10)).toBe(900);
    expect(applyDiscount(1234, 15)).toBe(1049);
  });
  test("rounds halves up", () => {
    expect(applyDiscount(1001, 50)).toBe(501);
    expect(applyDiscount(999, 50)).toBe(500);
  });
  test("allows the bounds of the range", () => {
    expect(applyDiscount(1000, 0)).toBe(1000);
    expect(applyDiscount(1000, 100)).toBe(0);
  });
  test("rejects a percent outside the range", () => {
    expect(() => applyDiscount(1000, -1)).toThrow("invalid discount percent");
    expect(() => applyDiscount(1000, 101)).toThrow("invalid discount percent");
  });
});
