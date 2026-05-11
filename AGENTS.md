# building-blocks — Agent Guidelines

## What this is

A self-paced course that teaches programming by building a brick-breaker
game one version at a time. Materials live in `docs/` as a VitePress site.
Each course has a runnable reference scaffold under `scaffold/<course>/`
that mirrors what learners build by following the units.

## Constraints

- **Learners type every line of game code by hand.** Never generate code
  into unit material that learners are expected to copy verbatim. Walk
  through principles, show *adjacent* worked examples, and let each unit's
  challenge require the learner to do the synthesis.
- **Audience is ages 9 and up reading on their own.** Plain prose, no
  jargon without inline definition, no assumed-experience phrasing like
  "as you know."
- **Each version is shippable.** A unit that leaves the learner with a
  half-broken game isn't done. Every unit must end with something
  playable.

## Project layout

```
docs/
  .vitepress/        -- VitePress config
  index.md           -- Landing page
  <course>/          -- One folder per course (procedural,
                        event-driven, object-oriented, functional,
                        reactive, entity-component-system)
    index.md         -- Course landing page
    unit-N.md        -- One file per unit
scaffold/
  <course>/          -- Runnable reference for each course's end-state
                        game. Learners do NOT clone these — they build
                        their own copies by following each unit.
```

## Build & verify

```sh
npm install
npm run docs:dev       # materials site, local with hot reload
npm run docs:build     # build the materials site

cd scaffold/procedural   # or another course
npm install
npm run dev            # run the scaffold
npx tsc --noEmit       # type-check
npm run build          # production build
```

Before merging, `npm run docs:build` must succeed at the root, and for
any touched scaffold, both `npx tsc --noEmit` and `npm run build` must
succeed.

## Testing

There's no test code in the repo today. When code lands that warrants
tests (a reusable engine helper, a build script), follow these
principles:

- **Strict TDD: red, green, refactor.** Write a failing test first;
  confirm it fails on an assertion. Write the minimum code to pass.
  Refactor with tests green.
- **100% coverage on tested files.** No coverage-ignore directives —
  restructure code so all branches are reachable.
- **Use Vitest.** Matches the Vite-based scaffold and what learners will
  eventually see.
- **Stubs over mocks; real systems over stubs.** Only stub what you can't
  test for real (third-party network calls). For DOM-touching engine
  code, use `jsdom` and assert on real DOM state.

We do not test unit markdown — review it with eyes.

## Git Workflow & PRs

**Never commit directly to `main`.** All changes go through a PR.

When committing changes:

1. Run `npm run docs:build` (if `docs/` touched) and `npx tsc --noEmit &&
   npm run build` in each touched scaffold. Fix any failures.
2. Create a new branch: `git checkout -b $USER/<feature-name>` (for
   example `jkakar/unit-3-explosions`).
3. Commit on that branch.
4. Push and open a PR.
5. Return the PR URL.

**Pipe commit messages and PR bodies from a single-quoted HEREDOC into
stdin.** Never use shared temp-file paths (`$TMPDIR`, `/tmp/claude/`) —
they persist across sessions and have silently picked up stale content
from earlier runs. `git commit -F -` and `gh pr create --body-file -`
both read from stdin.

```sh
git commit -F - <<'EOF'
unit: Add Unit 3 — explosions

Body paragraph.
EOF

gh pr create --title "unit: Add Unit 3 — explosions" --body-file - <<'EOF'
## What
...
EOF
```

**Prefix PR titles with the area of the change** — short lowercase,
colon, then the title. Pick the most specific prefix that fits.

| Prefix      | When to use |
|-------------|-------------|
| `unit:`     | Adding or revising a unit (under `docs/<course>/`) |
| `scaffold:` | Changes to a scaffold under `scaffold/<course>/` |
| `site:`     | VitePress config, theme, navigation, or landing page |
| `build:`    | Build, CI, or deploy tooling |
| `deps:`     | Dependency bumps |
| `repo:`     | Repo plumbing — `AGENTS.md`, `README.md`, `.gitignore`, etc. |

This list isn't exhaustive — add a new prefix when an existing one
doesn't fit. The goal is scanability.

**Do not hard-wrap lines in PR titles or descriptions.** GitHub wraps
markdown itself; hard-wrapping at 80 chars creates ugly mid-sentence
breaks. This rule applies to PR titles and bodies *only* — source
markdown still wraps at 80.

**Structure PR descriptions with What, Why, and Test plan.** Scale depth
to the size of the change. Omit Why when the motivation is obvious from
the change itself — but for `unit:` PRs, document the pedagogical "why
this unit, in this order" since that's the most valuable institutional
knowledge a learning repo accumulates.

```markdown
## What

What this PR adds or changes.

## Why

Motivation. For `unit:` PRs, why this unit lands here in the progression
— concepts introduced, what it sets up. For infra PRs, why this approach
and what alternatives were ruled out.

## Test plan

What you verified. For `unit:` PRs, include "read end-to-end" and any
scaffold-build steps run.
```

## Markdown style

Format source markdown files to read nicely at 80 characters. Wrap
prose, list items, and bold lead-ins so lines stay within 80 columns.
Code blocks, inline code, URLs, and headings may exceed 80 when breaking
would hurt readability.
