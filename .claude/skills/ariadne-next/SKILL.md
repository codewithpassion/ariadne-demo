<!-- ariadne:generated sha256=8c2d2cdc01eea11af18fb6ed4e165d7ac19a2195d94e57300b00f28e7c838bc7 -->
---
name: ariadne-next
description: Run an Ariadne issue's next stage on a runner and report its gate.
---

# Run the next stage

Use this when the person asks to move an issue forward, to run its next stage,
or to hand the work to a runner.

1. Get the issue identifier. Ask for it if the conversation does not name one.
2. Run:

   ```sh
   ariadne run <issue> --stage next
   ```

3. The command starts a run if the issue has none. When a run is already
   active it reports where that run stands: stages advance on their own, and
   the command does not move them. The stage itself runs on a runner, in its
   own worktree.

The stage runs on a runner, not in this conversation. Do not do the stage's
work here and do not edit files to help it along: local edits are no part of
the run.

4. Exit code 0: report what the command printed.
5. Exit code 2: the run is parked at a human gate, and the command printed the
   gate URL on its own line. Show that link to the person and stop: approving
   is theirs, in the browser or in Slack. Do not run the next stage on their
   behalf.

If the command says not logged in, tell the person to run `ariadne login` in
their own terminal; do not run it.

To see where an issue stands without running anything, use `ariadne-status`.
