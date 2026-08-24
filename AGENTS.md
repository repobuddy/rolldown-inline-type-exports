# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Skill Augmentations

When reading any `SKILL.md` file, always check whether a `SKILL.local.md` exists in the same directory. If it does, treat its contents as additional instructions that extend the base skill. Local augmentations take precedence over the base skill where they conflict.

## Commands

This repo uses `pnpm` workspaces with Turbo. Run commands from the repo root unless a package path is called out.

```sh
pnpm install
pnpm build
pnpm lint
pnpm check:fix
pnpm test
pnpm verify
pnpm plugin build
pnpm --filter @repobuddy/rolldown-inline-type-exports test -- src/hoist-exports.spec.ts
pnpm --filter @repobuddy/rolldown-inline-type-exports exec vitest run src/hoist-exports.spec.ts -t "inlines type alias with export { X }"
pnpm cs
pnpm release
```

Command notes:
- `pnpm verify` runs `knip` at the root plus each package's `verify` task through Turbo.
- `pnpm plugin build` targets the publishable package via the root `plugin` filter shortcut.
- Package-local `verify` runs `clean`, `build`, `lint`, and `test` together.
- Publishing is package-oriented: build first, then publish from `packages/rolldown-inline-type-exports`.

## Architecture

This is a small monorepo with one publishable package, `@repobuddy/rolldown-inline-type-exports`. The root workspace owns shared tooling only: Turbo orchestrates package tasks, Biome handles formatting and linting, Knip checks unused files and exports, Husky runs `commitlint` and `pnpm check` on `commit-msg`, and Changesets drives versioning and release automation.

The package itself is a Rolldown plugin that fixes declaration output after DTS generation. `inlineTypeExports()` in `packages/rolldown-inline-type-exports/src/inline-type-exports.ts` hooks `generateBundle()` and inspects every emitted `.d.ts`, `.d.mts`, and `.d.cts` asset or chunk. For each declaration file it delegates to `hoistExports()`, which rewrites a trailing `export { Foo, Bar }` or `export type { Foo }` block into inline exported declarations when matching local `type`, `interface`, or `declare` statements exist earlier in the file.

The important behavioral split is between local declarations and true re-exports. `hoistExports()` only inlines names that can be matched to declarations in the same file, and it preserves any remaining names in a trailing export block. That keeps the workaround narrowly scoped to the TS2742 portability problem described in the package README instead of changing general export semantics.

The tests in `packages/rolldown-inline-type-exports/src/hoist-exports.spec.ts` define the contract for the rewrite function directly. They cover the type-alias, interface, and `declare class` happy paths, plus the cases where mixed local/external exports or already-correct files must remain stable. Build output is produced by `tsdown` as ESM with generated DTS files in `dist/`; consumers are expected to add this plugin to their own `tsdown` or Rolldown config rather than using this repo as an application.

## README Notes

- The package exists as a workaround for DTS output that triggers `TS2742` in downstream consumers.
- Expected consumer usage is `plugins: [inlineTypeExports()]` in a `tsdown` config with `dts: true`.
- The workaround is intended to be temporary and may be deprecated once upstream emits inline type exports by default.
- Root release flow uses Changesets and GitHub Actions; manual publishing is still documented from `packages/rolldown-inline-type-exports` after a successful build.

## Commit Discipline

Commit every self-contained unit of work — code, config, skills — as its own commit before moving on.

**Unit of work:** one coherent, independently revertable change — one domain's refactor, one feature, one bugfix, one test suite expansion for one concern, one config change. Never two unrelated concerns in the same commit. A TDD red-green-refactor cycle alone is not a commit boundary; commit when the full intended change is complete and tests pass. If the working tree has unrelated changes, leave them unstaged — commit the current unit first, then continue.

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: `git add <files>`, then verify with `git diff --cached`
- Never use `git add .`, `git add -A`, or `git add -p` (interactive commands agents cannot run)
- Never commit with red tests; run validation commands first
- Use the `commit-work` skill when committing (staging, splitting, message writing)
