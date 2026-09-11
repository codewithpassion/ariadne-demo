# ARIA-10 plan: add `isEmpty()` to the cart module

## Input

The analyse stage handed over no `analysis.md`: the job listed no earlier
artifacts and `docs/ariadne/ARIA-10/` did not exist. This plan comes from the
issue text and a direct reading of `src/cart.ts`, `src/cart.test.ts`,
`package.json` and `CLAUDE.md`. The change is one small function, so the
missing analysis does not leave any decision open.

## Approach

Add one exported function to `src/cart.ts`, below the existing functions:

```ts
/** True when the cart has no line items. */
export function isEmpty(items: LineItem[]): boolean {
  return items.length === 0;
}
```

It follows the module's conventions: a named export, a one-line JSDoc comment,
no mutation of its input, and it reuses the existing `LineItem` type. The
issue defines "empty" as "no line items," so the function only checks the
array's length. `cartTotal` and `formatCents` stay as they are.

Add a `describe("isEmpty", ...)` block to `src/cart.test.ts` with one test for
`[]` (expect `true`) and one for a cart holding a single line item (expect
`false`). Add `isEmpty` to the existing import line.

**Rejected alternative:** treating a cart whose line items all have quantity 0,
or whose total is 0, as empty. The issue says "true when there are no line
items." `cartTotal` already rejects zero quantities as invalid, so
`isEmpty` has no reason to interpret them. It also should not throw on bad
items the way `cartTotal` does, because it never reads the items.

## Steps

1. **Add `isEmpty` and its tests** (one commit)
   - `src/cart.ts`: append the `isEmpty` function shown above.
   - `src/cart.test.ts`: import `isEmpty`, then add a `describe("isEmpty")`
     block with two tests:
     - `"is true for a cart with no line items"`: `expect(isEmpty([])).toBe(true)`
     - `"is false for a cart with line items"`:
       `expect(isEmpty([{ sku: "a", unitPriceCents: 100, quantity: 1 }])).toBe(false)`

The project rule is that every change to `src/` ships with a test, so the
function and its tests go in the same commit.

## Verification

- `bun test`: the two new `isEmpty` tests pass, and the existing
  `cartTotal` and `formatCents` tests still pass.
- `bun run typecheck`: no errors.
- `git diff main -- src/cart.ts` shows only added lines. That confirms the
  existing functions were left alone.

## Risks

- **No analysis artifact.** If the analyst meant to deliver findings that
  never arrived, this plan did not see them. For a function this size that
  is unlikely to matter.
- **The branch has not caught up with other issues.** Other branches in this
  repository add functions to the cart module, for example
  `f6356dd Add clear() to the cart module`. If one of them merges to `main`
  first, both changes append to the end of `src/cart.ts` and
  `src/cart.test.ts` and will conflict textually. Resolving that means keeping
  both blocks. Nothing needs to be decided now.
- **The plan is wrong if** "empty" was supposed to mean something beyond "no
  line items," such as zero total quantity. The issue text says otherwise.

## Out of scope

Refactoring the existing functions, using `isEmpty` inside `cartTotal`, README
changes, and edits to `.github/workflows/` or `.ariadne/`.
