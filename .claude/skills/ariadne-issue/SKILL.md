<!-- ariadne:generated sha256=55b8228a1f963f65d6747b9d82ad4f044b0b46b982f35138e618dea586cf1bd7 -->
---
name: ariadne-issue
description: Create an Ariadne issue from the current conversation.
---

# Create an Ariadne issue

Use this when the person asks to file, open, or create an issue for work that
came up in this conversation.

1. Read back over the conversation and settle on one unit of work. If two
   unrelated things came up, ask which one, or create them one at a time.
2. Write a title of at most eighty characters, in the imperative.
3. Write the body as markdown into a temporary file: what is wanted and why,
   the files and symbols involved, the acceptance criteria, and anything still
   open. Include enough that someone who did not see this conversation can act
   on it.
4. Run:

   ```sh
   ariadne issue create --title "<title>" --body-file <path>
   ```

5. The command prints the issue's key and the issue's URL. Show both to the
   person; the URL is where the issue lives in the web app. It also records
   the key in `.ariadne/issues.json`, which is where `ariadne run` and
   `ariadne status` look keys up. If the key is not there (a clone without
   the map), pass the issue id instead.

The project has to be registered first: `.ariadne/project.json` names the
workspace and the project, and `ariadne init` writes it. If the command says
the project is not registered, say so rather than guessing at flags.

If the command says not logged in, tell the person to run `ariadne login` in
their own terminal; do not run it.

Creating an issue starts no work. A stage runs only when someone runs
`ariadne run`.
