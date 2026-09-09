# ARIA-2: Add a cart item count helper

## Approach

Add an exported `itemCount(items: LineItem[]): number` to `src/cart.ts` that walks
the line items and sums their quantities, rejecting any quantity that is not a
positive integer, and cover it with tests in `src/cart.test.ts`. The new function
writes the validation check inline, exactly as `cartTotal` writes it today. Three
lines, same condition, same error message.

The alternative I rejected was pulling that check out into a shared
`assertValidQuantity(item)` helper and having `cartTotal` call it too. It is the
tidier shape on paper, but it means editing a function that works and that the
issue does not ask us to touch, and it turns a purely additive change into one a
reviewer has to re-verify against the existing tests. The project's conventions
say to keep changes surgical and to skip abstractions for their own sake, so
duplicating three lines is the cheaper trade here. If a third caller ever needs
the same check, that is the moment to extract it.

One thing the reader should know up front. There is no `analysis.md` in this
worktree, because the analysis stage left no artifact. The issue is specific
enough to plan directly from, so this plan comes from the issue text and the code
itself. I guessed nothing that the code does not already show.

## The contract

Spelled out so the builder does not have to infer it:

- Signature: `export function itemCount(items: LineItem[]): number`
- Returns the sum of `item.quantity` across all items.
- An empty array returns `0`.
- For each item, if `!Number.isInteger(item.quantity) || item.quantity <= 0`,
  throw ``new Error(`invalid quantity for ${item.sku}`)``.
- The check sits inside the loop, so a bad item throws as soon as the loop
  reaches it. That matches how `cartTotal` behaves now.
- One-line `/** ... */` doc comment above it, in the style of its neighbours.
- Place it directly after `cartTotal` in the file, before `formatCents`.
- The function does not validate `unitPriceCents`. Neither does `cartTotal`, and
  the issue does not ask for it.

## Steps

### Step 1: Add `itemCount` and its tests

Files: `src/cart.ts`, `src/cart.test.ts`

Add the function per the contract above, and in the same commit add a
`describe("itemCount")` block to `src/cart.test.ts` mirroring the layout of the
existing `cartTotal` block. Four tests:

1. Sums quantities across several items.
2. An empty cart returns `0`.
3. A zero quantity throws `"invalid quantity for a"`.
4. A non-integer quantity, say `1.5`, throws `"invalid quantity for a"`.

Tests 3 and 4 together cover both halves of the validation condition. The
existing `cartTotal` tests only exercise the zero case, so this is more coverage
than a strict mirror would give. Worth having, because otherwise the suite never
runs the non-integer branch at all.

This is deliberately one step rather than two. The project requires that every
change to `src/` arrive with a test, so a commit adding the function alone would
break that rule, and a tests-first commit would leave CI red in between.

## Verification

Run both from the worktree root. `bun run typecheck` prints `$ tsc --noEmit` and
nothing else. `bun test` passes, with the suite going from 3 tests to 7.

Those are the same two commands `.github/workflows/ci.yml` runs on the pull
request, so a green local run means a green CI run. I checked the baseline before
writing this. Typecheck is clean and the 3 existing tests pass, so any failure the
builder sees comes from this change and not from the starting state.

## Risks

The change is small and additive, so there is not much to go wrong. Two things
worth flagging:

- **Duplication drift.** The quantity check now lives in two places. If the
  validation rule ever changes, someone has to remember to change both. I
  accepted that deliberately, for the reasons in the approach section, and the
  cost is one grep if it ever comes up.
- **"The same quantity validation" might have meant shared code, not identical
  behaviour.** The issue does not say which, and I read it as behaviour. If the
  gate reviewer wants the extracted helper instead, that is a one-line note back
  and a larger step 1 that also edits `cartTotal`.
