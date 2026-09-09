# ariadne-demo

A small Bun and TypeScript library used as the target project for the Ariadne
software factory. It has one module, `src/cart.ts`, with tests next to it.

- Run tests with `bun test`, typecheck with `bun run typecheck`.
- Keep functions pure and tested. Every change to `src/` comes with a test.
- Do not edit `.github/workflows/` or `.ariadne/`; the factory owns them.

<!-- ariadne:start -->
## Ariadne

This project is registered in Ariadne, which runs issues through staged,
gated workflows on runners. `.ariadne/project.json` names the workspace and
the project. Three skills talk to it:

- `ariadne-issue` creates an issue from the current conversation.
- `ariadne-next` runs an issue's next stage on a runner and reports its gate.
- `ariadne-status` reports where an issue stands.

Stages run on runners in their own worktrees, never in this checkout. Nothing
in this section is edited by hand: `ariadne init` rewrites it between the
markers.
<!-- ariadne:end -->
