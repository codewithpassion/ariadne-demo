# ARIA-1: Add a discount helper to the cart module

No `analysis.md` was handed to this stage, and none exists in the worktree. This
plan comes from the issue text and from reading `src/cart.ts`, `src/cart.test.ts`,
`package.json`, and `tsconfig.json` directly.

## Approach

Add one exported function to `src/cart.ts`, next to `cartTotal` and
`formatCents`, and add a `describe("applyDiscount", ...)` block to
`src/cart.test.ts`. Nothing else in the repository changes.

The body is two lines. Validate the percent, then return

```ts
Math.round((totalCents * (100 - percent)) / 100)
```

The order of operations matters. `totalCents * (100 - percent)` is integer
arithmetic and stays exact, so a true half like 500.5 is representable, and the
single division by 100 is the only place a float appears. `Math.round` in
JavaScript rounds halves toward positive infinity, which is round half up.
Writing it as `totalCents * (1 - percent / 100)` instead would be wrong in
practice: `percent / 100` is inexact for most percents, so a value that should
land on exactly `.5` can land a hair below it and round down.

The alternative I rejected is rounding the discount amount and subtracting it,
`totalCents - Math.round(totalCents * percent / 100)`. It disagrees with the
issue on exact halves. For 1001 cents at 50%, the issue asks for the discounted
total 500.5 rounded half up, which is 501. Rounding the discount first gives
1001 - 501 = 500. The issue says "returns the discounted total in cents,
rounding half up", so the rounding belongs on the total.

Invalid percents throw a plain `Error`, matching how `cartTotal` rejects a bad
quantity. Message in the existing lowercase style:
`` `invalid discount percent: ${percent}` ``.

The guard is `!(percent >= 0 && percent <= 100)` rather than
`percent < 0 || percent > 100`. Both reject the same numbers, but the first also
rejects `NaN`, which is not in the range 0 to 100 either. Same line count.

## Steps

### 1. Add `applyDiscount` to `src/cart.ts` and its tests to `src/cart.test.ts`

Files: `src/cart.ts`, `src/cart.test.ts`

In `src/cart.ts`, append an exported `applyDiscount(totalCents: number, percent: number): number`
with a one-line doc comment in the style of the two functions above it. Guard the
percent, then return the rounded total as shown above.

In `src/cart.test.ts`, import `applyDiscount` alongside the existing imports and
add one `describe` block. The cases, with the values a builder should assert:

| call | expected | why it is in the list |
| --- | --- | --- |
| `applyDiscount(1000, 10)` | `900` | the ordinary case, no rounding |
| `applyDiscount(1001, 50)` | `501` | 500.5 exactly; half up gives 501, banker's rounding would give 500 |
| `applyDiscount(999, 50)` | `500` | 499.5 exactly, the other half-up direction |
| `applyDiscount(1234, 15)` | `1049` | 1048.9, rounding that is not a half |
| `applyDiscount(1000, 0)` | `1000` | lower bound is allowed |
| `applyDiscount(1000, 100)` | `0` | upper bound is allowed |
| `applyDiscount(1000, -1)` | throws | below the range |
| `applyDiscount(1000, 101)` | throws | above the range |

Use `expect(() => ...).toThrow("invalid discount percent")` for the two throwing
cases, the way the existing `cartTotal` test asserts on its message.

Keep every total positive. Negative totals are not in the issue, and asserting
on them would pin down `Math.round(-2.5) === -2` as intended behaviour when
nobody has decided that.

Both files change together because `CLAUDE.md` says every change to `src/` comes
with a test.

## How this is verified

`bun test` and `bun run typecheck`. Both are green on the current worktree
before any change: 3 tests pass, `tsc --noEmit` is silent. After the change, all 8 cases
above pass alongside the 3 existing tests, and `bun run typecheck` is still
silent. How the 8 cases are grouped into `test()` blocks is the builder's call;
every one of them has to be asserted.

The row for `applyDiscount(1001, 50)` is the one that actually earns its place.
It fails if the builder reaches for the subtract-the-discount formula or for a
rounding mode that is not half up. The rest would pass under any of them.

## Risks, and what would have to be true for this plan to be wrong

- **Fractional percents are accepted.** The issue does not say the percent must
  be an integer, so `applyDiscount(1000, 12.5)` is allowed and returns 875. If
  the reviewer wanted integers only, this needs another guard. Non-dyadic
  percents such as 33.3 lose exactness in the multiply, which is unavoidable in
  binary floating point and not worth guarding against here.
- **`totalCents` is not validated.** The issue asks for a check on the percent
  and nothing else, and `cartTotal` already rejects bad quantities upstream. A
  non-integer or huge `totalCents` will produce whatever `Math.round` produces.
  If the reviewer wants an integer check on the total too, that is a second
  guard, not a redesign.
- **Half up is read as toward positive infinity.** For the positive totals in
  the tests this is the same as "away from zero", so the choice only shows up
  for negative totals, which the tests deliberately leave alone.
