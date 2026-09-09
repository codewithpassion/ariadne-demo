# ARIA-4: Add `clear()` to the cart module

## Approach

`src/cart.ts` is a small module of pure functions over a `LineItem[]`. Nothing
in it mutates its argument, and the project's `CLAUDE.md` says to keep functions
pure. So `clear` is pure too. It takes a cart and returns a fresh empty cart
alongside the count of line items it dropped:

```ts
export function clear(items: LineItem[]): { items: LineItem[]; removed: number }
```

The issue raises this as an open question and then answers it. Default to the
pure form unless told otherwise, so that is what this plan does. It also takes
the issue's second default, where `removed` counts line items (`items.length`)
rather than the sum of their quantities, and puts that in the doc comment so the
choice is visible to anyone reading the code.

The rejected alternative is the mutating form, `clear(items: LineItem[]):
number`, emptying the array in place with `items.length = 0` or
`items.splice(0)` and returning the count. It reads more directly off the phrase
"empties the cart", and it really is a one-line change if the gate prefers it.
It loses because it would make `clear` the only impure function in the module,
against both `CLAUDE.md` and the issue's stated default.

### How the acceptance criteria map onto the pure form

The criteria are phrased in the mutating idiom, so the translation is worth
stating outright. This is what the gate approves and what the tests assert.

| Criterion | Pure form |
| --- | --- |
| "leaves it with no items" | the returned `items` is `[]` |
| "returns N" | the returned `removed` is `N` |
| (implied by purity) | the caller's input array is untouched |

## Steps

### 1. Add `clear` to the cart module with tests covering both cases

*Files: `src/cart.ts`, `src/cart.test.ts`*

One commit. The project rule is that every change to `src/` comes with a test,
so the function and its tests ship together.

In `src/cart.ts`, append after `formatCents`, matching the existing one-line
doc-comment style and adding no dependencies:

```ts
/** Empties a cart. Returns a fresh empty cart and the number of line items removed. */
export function clear(items: LineItem[]): { items: LineItem[]; removed: number } {
  return { items: [], removed: items.length };
}
```

In `src/cart.test.ts`, extend the existing import to
`import { cartTotal, clear, formatCents } from "./cart";` and add a
`describe("clear")` block below the existing ones, in the same `bun:test` style,
with two tests:

- "empties a cart and reports the count". Given a two-item cart, the result's
  `items` is `[]` and `removed` is `2`. Then assert the input array still has
  length 2. That third assertion is what catches an implementation reaching for
  `splice`, and it is the only place the tests check purity.
- "clearing an empty cart returns 0". Given `[]`, the result's `items` is `[]`
  and `removed` is `0`.

## How the result is verified

- `bun test` passes, with the two new `clear` tests among them. I ran both
  commands against the unmodified worktree while planning and both are green
  there (3 pass, clean typecheck), so any failure after this change belongs to
  the change.
- `bun run typecheck` passes. This is the check that confirms the returned
  object's shape matches the declared return type.
- `git status` shows exactly `src/cart.ts` and `src/cart.test.ts` modified, and
  nothing under `.github/workflows/` or `.ariadne/`.
- The change adds no user interface, CLI, or I/O. The diff is one exported
  function and one test block.

## Risks, and what would have to be true for this plan to be wrong

- The gate wants literal mutating semantics. If "empties the cart" is meant to
  mutate the caller's array, the signature becomes
  `clear(items: LineItem[]): number` with `items.length = 0`, and the test
  asserting the input is untouched inverts to assert it was emptied. That is
  cheap to switch, one line of source and one assertion, but it has to be
  decided before the tests are written rather than after.
- "Number of items" meant the sum of quantities. If a two-item cart holding
  quantities 2 and 3 should report 5 rather than 2, `removed` becomes a reduce
  over `quantity` and the first test's expected count changes. The issue says to
  assume `items.length`, and this plan does.
- Returning an object is more shape than a caller wants. Anyone who needs only
  the count now has to destructure. That is the price of the pure form, accepted
  rather than mitigated.
