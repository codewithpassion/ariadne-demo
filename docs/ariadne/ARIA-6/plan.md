# ARIA-6 — Add a `total()` helper to the cart module

## Approach

Add one exported function, `total(items: LineItem[]): number`, to `src/cart.ts`,
and a `describe("total", ...)` block to `src/cart.test.ts` covering an empty
cart, a single item, and several items. `total` sums `unitPriceCents * quantity`
across the line items and does nothing else: no validation, no rounding, no new
types. `cartTotal` and `formatCents` are not touched, and the existing tests are
left as they are. This is one commit's worth of change across two files, which
matches the project rule in `CLAUDE.md` that every change to `src/` arrives with
its test.

The alternative was to implement `total` as a wrapper — `return cartTotal(items)`
— which would avoid having two functions that compute nearly the same sum. It
was rejected because `cartTotal` throws on a non-positive or non-integer
quantity, and the issue asks only for the sum of price times quantity. A wrapper
would give `total` unrequested throwing behavior and leave it as an alias with no
meaning of its own. The plan takes the issue literally instead, and the overlap
between the two functions is recorded as a risk below for the approval gate to
judge.

Note on inputs: the analyse stage did not produce an `analysis.md` — no such file
exists in this worktree, and the job prompt carried no artifact from it. This
plan was written from the issue text and from reading `src/cart.ts`,
`src/cart.test.ts`, `package.json`, `tsconfig.json`, and `.github/workflows/ci.yml`
directly.

Note on the field name: the issue says "price times quantity", but the existing
`LineItem` type has no `price` field. The amount is `unitPriceCents`, so `total`
sums `unitPriceCents * quantity` and returns cents, consistent with `cartTotal`.

## Steps

### 1. Add `total()` to the cart module

Touches: `src/cart.ts`

Append after `formatCents`, leaving the two existing functions unchanged:

```ts
/** Sum of unitPriceCents times quantity over all line items. Does not validate quantities; see cartTotal. */
export function total(items: LineItem[]): number {
  let sum = 0;
  for (const item of items) {
    sum += item.unitPriceCents * item.quantity;
  }
  return sum;
}
```

A `for` loop rather than `reduce`, to match the shape of `cartTotal` directly
above it. The doc comment names the units and states the absence of validation,
so the difference from `cartTotal` is visible without reading the body.

Verify: `bun run typecheck` passes.

### 2. Add tests for `total()`

Touches: `src/cart.test.ts`

Extend the import on line 2 to `import { cartTotal, formatCents, total } from "./cart";`,
then append a new block after the `formatCents` block, matching the existing
`describe` / `test` / `toBe` style:

```ts
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
```

The three-item fixture reuses the values from the existing `cartTotal` test, so
the two functions are seen to agree on valid input.

Verify: `bun test` reports 6 passing tests.

## Verification

The `checks` gate runs what CI runs. From the worktree root, in this order —
the same sequence as `.github/workflows/ci.yml`:

1. `bun install --frozen-lockfile`
2. `bun run typecheck` — must pass clean; `tsconfig.json` has `strict: true`.
3. `bun test` — must report 6 pass, 0 fail, across 1 file.

Baseline before the change is green: 3 pass, 0 fail, and a clean typecheck.
After the change the three existing tests must still pass untouched, and the
three new ones must pass. Nothing outside `src/cart.ts` and `src/cart.test.ts`
changes; `bun.lock` must not be modified.

## Risks

**`total` and `cartTotal` compute nearly the same thing.** On valid input they
return identical results; they differ only in that `cartTotal` rejects a
non-positive or non-integer quantity. Two similarly named functions on the same
type invite a caller picking the wrong one and skipping validation by accident.
For this plan to be right, the issue has to mean what it says — a second,
non-validating sum alongside the existing one. If the real intent was to rename
`cartTotal`, to alias it, or to replace it, this plan is wrong and the issue
should be restated before building.

**No analysis stage output.** `analysis.md` was never produced, so nothing was
inherited about scope or edge cases and this plan rests on the issue text and the
code alone. If the analyst had a constraint in mind that the issue does not
state, it is not reflected here.

**Behavior on a negative or fractional quantity is unspecified.** `total` will
return a negative or fractional number rather than throwing. The issue does not
say what should happen, and the requested tests do not cover it, so the plan
leaves it undefined rather than inventing a rule.
