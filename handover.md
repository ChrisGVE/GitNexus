# Handover — 2026-05-05

## Current work

Session completed: both PRs merged (#1324 worker-pool fix, #1347 rate-limit test fix). Branches synced (`main` and `dev` at `816ae5e6`). No uncommitted changes. About to start language branch consolidation and upstream issue triage.

## Task-master

- **Tag/milestone**: none active
- **In progress**: none
- **Blocked**: none
- **Recently completed**: none (work was PR-driven, not task-master tracked)

## Resume instructions

### Phase 1: Language branch consolidation (one branch per language)

Current language branches (all need main merge):
- `feat/bash-language-support-v2` — 3 commits (provider + extractors + integration test + entrypoint fix)
- `feat/lua-language-support-v2` — 3 commits (provider + extractors + integration test + entrypoint fix)
- `feat/scala-language-support-v2` — 3 commits (provider + extractors + integration test + entrypoint fix)
- `refactor/language-provider-consolidation` — 3 commits (consolidates per-language patterns into LanguageProvider)

Also present (workspace extractors, already merged upstream as PR #1260):
- `feat/node-workspace-extractor` — can be deleted (merged)
- `feat/rust-workspace-extractor` — can be deleted (merged)

Steps:
1. Delete stale workspace extractor branches: `git branch -d feat/node-workspace-extractor feat/rust-workspace-extractor`
2. For each language branch (`bash`, `lua`, `scala`):
   a. `git checkout <branch>`
   b. `git merge main --no-edit` — resolve any conflicts
   c. Build and test: `export PATH="/Users/chris/.local/share/fnm/node-versions/v20.19.0/installation/bin:$PATH"` then `npx vitest run` for relevant tests
   d. Push updated branch
3. The `refactor/language-provider-consolidation` branch: evaluate whether it's still needed or if its changes are superseded by upstream refactors. Merge main and test.
4. **Goal**: each language gets its own clean branch for its own upstream PR later. Do NOT group languages into one PR (maintainer rejected grouped language PRs in past sessions).

### Phase 2: Merge language branches into dev

1. `git checkout dev`
2. Merge each language branch into dev one at a time, testing after each
3. Resolve conflicts (likely in shared files like language registry, vitest config)
4. Push dev

### Phase 3: Global install of consolidated dev

1. `export PATH="/Users/chris/.local/share/fnm/node-versions/v20.19.0/installation/bin:$PATH"`
2. From repo root (gitnexus subdir): `cd gitnexus && npm run build && npm install -g .`
3. Verify: `gitnexus --version` should show updated version
4. Test with `gitnexus analyze` on a sample repo

### Phase 4: Upstream issue triage

Prioritized open issues to investigate (benefit: improve the tool we use):

**High-value / likely fixable:**
- **#1346** — rc.63 regression: Go projects fail with `scopeResolution`. Recent regression, likely tractable.
- **#1353** — MCP can't be connected. Directly affects our workflow.
- **#1287** — FTS indexes fail to create. DB path issue, may be related to #1255.
- **#1255** — query/FTS broken in 1.6.3. DB opened read-only. Core functionality.
- **#1301** — `--embeddings` fails with VECTOR extension. Affects embedding workflow.

**Already has PRs (review/test/suggest improvements):**
- **#1288** — tree-sitter callback API for large files (PR by geekalaa)
- **#1286** — GITNEXUS_BACKEND_URL env var for Docker (PR by geekalaa)
- **#1305** — sanitize repo name to prevent argument injection (PR by RinZ27)

**Feature requests (lower priority):**
- **#1335** — `gitnexus export` per-table graph export
- **#1308** — select multiple repositories in MCP tools
- **#1265** — opt out of CLAUDE.md/AGENTS.md/.gitignore generation

Approach: for each issue, reproduce → check if already fixed on main → propose fix PR or comment suggesting close.

## Pending decisions

- **Language provider consolidation branch**: Keep or abandon `refactor/language-provider-consolidation`? Upstream may have moved past it. Need to evaluate overlap with current LanguageProvider architecture.
- **Upstream language PRs**: Maintainer previously rejected grouped language PRs. Confirm strategy: one PR per language, or ask maintainer first if new languages are welcome at all?
- **Which upstream issues to tackle first**: User preference on priority order above.

## Key context

### Merged this session
| PR | Title | Outcome |
|----|-------|---------|
| [#1324](https://github.com/abhigyanpatwari/GitNexus/pull/1324) | fix(pool): wait for replacement worker online before dispatch | **Merged** |
| [#1347](https://github.com/abhigyanpatwari/GitNexus/pull/1347) | fix(test): widen rate-limit test window to prevent flake on Windows CI | **Merged** |

### Maintainer preferences (carried over)
- **No force-push** — @magyargergo explicitly requested preserving git history
- **No grouped language PRs** — maintainer closed grouped language PRs in past sessions. One language per PR.
- **CI bot reviews** — repo has automated Claude review bot. Reviews are thorough.
- **No new language support?** — Last attempt was rejected. Confirm with maintainer before submitting language PRs upstream.

### Node version — critical
- **CI uses Node 20** (`node-version: 20` in all workflows)
- **System has Node 25.9.0** — breaks tree-sitter-kotlin, onnxruntime-node, CLI e2e tests
- **PATH for tests**: `export PATH="/Users/chris/.local/share/fnm/node-versions/v20.19.0/installation/bin:$PATH"`

### Prettier gotcha
- Local `npx prettier` may use stale cached version. Use `npx --yes prettier` to match CI behavior.

### Branch topology
- `main`: synced with upstream (`816ae5e6`)
- `dev`: merged main (`816ae5e6` + dev merge commit), pushed
- `fix/worker-pool-test-flake`: can be deleted (merged as #1324)
- `fix/rate-limit-test-window`: can be deleted (merged as #1347)
- `feat/bash-language-support-v2`: needs main merge
- `feat/lua-language-support-v2`: needs main merge
- `feat/scala-language-support-v2`: needs main merge
- `refactor/language-provider-consolidation`: needs main merge, may be obsolete
- `feat/node-workspace-extractor`: delete (merged as #1260)
- `feat/rust-workspace-extractor`: delete (merged as #1260)

### Upstream remote
- `upstream` → `https://github.com/abhigyanpatwari/GitNexus.git`
- `origin` → `git@github.com:ChrisGVE/GitNexus.git`

### LadybugDB native binary — OUR PROBLEM
`@ladybugdb/core@0.16.1`. darwin-x64 crashes during bulk graph writes (`gitnexus analyze`). MCP server works for read-only querying but the write crash means we cannot build a functioning index locally. This is NOT someone else's problem — we ship this MCP, so we own making it work end-to-end. Investigate: native binding compatibility with Node 20/25, potential memory pressure from large repos, whether a newer `@ladybugdb/core` release fixes it, or whether we need to patch/vendor the binding. Without a working `analyze`, the tool is read-only on stale data.

### Global install location
- `/usr/local/bin/gitnexus` → `/usr/local/lib/node_modules/gitnexus/dist/cli/index.js`
- Currently v1.6.3 — needs rebuild from dev after language branches merge
