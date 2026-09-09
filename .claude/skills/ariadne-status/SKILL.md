<!-- ariadne:generated sha256=854093f31b9b8cc656195e4586a6c36fe793029638f62ae1ed0a43efd32a51dd -->
---
name: ariadne-status
description: Report where an Ariadne issue stands.
---

# Ariadne issue status

Use this when the person asks where an issue is up to, whether a stage has
finished, or what a run is waiting on.

Run:

```sh
ariadne status <issue>
```

It prints the issue's key and URL, the latest run's status, the stage it is
on, any gate it is parked at, and the pull request when the deliver stage
opened one.

Report what it printed, and pass the links on: the issue URL for the person,
the gate link when the run is parked, the pull request when one is named. Do
not infer progress from this checkout: the run happens on a runner in its own
worktree, and nothing about it shows up here.

If the command says not logged in, tell the person to run `ariadne login` in
their own terminal; do not run it.

If the person then wants to move the issue on, that is `ariadne-next`.
