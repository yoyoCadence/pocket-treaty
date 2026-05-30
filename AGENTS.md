# AGENTS.md

This file is the shared collaboration contract for Codex, Claude Code, and human contributors.

---

## 0. Project Context

- **Project name:** Pocket Treaty（口袋條約）
- **Project goal:** Mobile-first PWA for expense tracking and split settlement. Solves the real-world problem of tracking who owes whom when couples or family members take turns paying shared expenses.
- **Target users:** Personal use first — couples and family members who share daily expenses (meals, drinks, shopping, transport). Future: multi-person groups, custom split ratios.
- **Tech stack:** Vite + React + TypeScript + Tailwind CSS + Supabase + Recharts + date-fns + vite-plugin-pwa + Zustand (if needed) + lucide-react + clsx/tailwind-merge
- **High-risk areas:**
  1. **Supabase RLS** — GitHub Pages frontend is public; anon key exposure is expected and normal; security depends entirely on RLS policies. Never use `service_role` key on client.
  2. **Debt calculation correctness** — Split logic must live in `src/lib/settlement.ts`, not in React components. Debts must be derived from `expense + shares + settlements`, never stored as final result.
  3. **Mobile UX** — Add Expense flow must complete in 5–10 seconds. Must feel like a real mobile app, not a web admin panel.
  4. **Data consistency** — `expense` and `expense_shares` must stay in sync. Edits and deletes must cascade to shares. Settlements must not corrupt original expense records.
  5. **GitHub Pages / PWA cache** — Base path must match repo name. PWA service worker can serve stale versions; cache invalidation strategy is required.
- **Architecture constraints:**
  - Mobile-first layout; bottom navigation; desktop just must not break
  - Mock-first development: validate UI flow and settlement logic before touching Supabase
  - Settlement calculation isolated in `src/lib/settlement.ts` — pure functions, no React imports
  - Supabase integration only after mock MVP is working
  - No backend server; no Firebase; no heavy UI framework
  - No `service_role` key anywhere; no committed `.env`; `.env.example` for placeholders only
  - Follow additive edits policy from Section 5; update `tasks.md` after every completed phase
- **Verification commands:**
  ```
  npm install
  npm run dev
  npm run build
  npm run preview
  npm run lint
  ```

---

## 0.1 Current Technical State

> Updated as project progresses.

- **Main entry points:** `src/main.tsx` → `src/app/App.tsx` → 5 pages under `src/pages/`; routing via react-router-dom BrowserRouter
- **Storage / data model:** Phase 1–6: Zustand store (`src/stores/useAppStore.ts`) seeded with mock data from `src/data/mockData.ts`. TypeScript types in `src/types/database.ts`. Phase 7+: Supabase.
- **Settlement logic:** Pure functions in `src/lib/settlement.ts`. Mock data produces net balance of NT$170 (我淨欠女友 = 250 + 80 − 60 − 100).
- **Test coverage:** 無（settlement.ts is pure and testable; add tests in Phase 2）
- **Deployment / cache notes:** GitHub Pages deployment planned in Phase 10; base path will be `/pocket-treaty/`; PWA cache invalidation strategy TBD. Note: on this machine, `npm install` requires `strict-ssl=false` due to SSL cert verification issues.

---

## 1. Execution Modes

Agents must operate in one of two modes:

### Mode A: Planning / Architecture
- Analyze the request
- Propose structure and changes
- Outline risks and next steps
- **DO NOT modify files yet**

### Mode B: Implementation
- Apply changes strictly based on the agreed plan
- Avoid introducing new design decisions mid-implementation

If the mode is unclear, default to **Mode A first**.

For clear low-risk tasks such as typo fixes, focused tests, or small documentation updates, agents may proceed in **Mode B** directly while still summarizing the change afterward.

---

## 2. Scope Control Rules

Agents must strictly limit changes to the requested scope.

Do NOT:
- Refactor unrelated files "while you are here"
- Rename or restructure directories outside the task scope
- Modify styling, formatting, or naming conventions globally without instruction

If an improvement is detected outside scope:
- Propose it instead of implementing it

---

## 3. Prohibited Behaviors

Do not:
- Silently replace or rewrite major files without instruction
- Mix a feature task with broad unrelated cleanup
- Sneak in schema, auth, or deployment edits under an unrelated feature PR
- Turn the repo into multiple conflicting architectural styles

---

## 4. Change Requirements

Every substantial change must make these clear:
- What changed
- Why this change was made
- What risks remain
- What the next recommended step is

The goal is handoff clarity, not just code delivery.

---

## 5. Canonical Baseline & Editing Rules

All changes must treat the current repository content as the canonical baseline.

- Preserve existing language, structure, and major content unless explicitly instructed otherwise
- Prefer **additive edits** over rewrites
- Do NOT replace entire files unless explicitly requested
- Do NOT reorganize large sections without clear instruction

---

## 6. Handoff Friendliness

Code and documentation should be written so another agent or human can continue without relying on private memory or one-off chat context.

- Write module responsibilities clearly
- Keep comments focused and actionable
- Make placeholders explicit
- Prefer obvious extension points over clever shortcuts

---

## 7. Branch / PR Hygiene

At the start of every task:
- Check current branch and worktree status first
- If starting from product baseline, switch to `main`, fetch, and fast-forward from `origin/main` before creating a new branch
- If already on a feature branch, confirm it is the intended branch for this task

Before opening or updating a PR:
- Fetch and fast-forward local `main` from `origin/main`
- Branch from current `main`, not from an older local checkout
- Before pushing, check the branch against `origin/main` again — if `main` moved, rebase first
- Do not re-submit duplicate generated assets or older runtime code under the same filenames

---

## 8. Task Lifecycle

Tasks must move through the following states:

**Backlog → Next → In Progress → Done**

Use `tasks.md` as the default lightweight task board unless the project explicitly uses GitHub Issues, Linear, Notion, or another tracker.

Rules:
- Do not start a task that is not in Next or In Progress
- Move task to In Progress before implementation
- Move to Done only when completed
- Do not silently skip or reorder tasks
- For tiny fixes or direct user requests, agents may complete the work first, then add or update the task record afterward

---

## 9. Task Granularity Rule

Tasks must be:
- Small enough to complete in one session
- Clear enough that no interpretation is needed
- Independent enough to not require large refactors

Avoid vague tasks like "implement system", "build feature", or "add 3D".

---

## 10. Security Baseline

### Environment variables
- Never print secret values to the terminal — only check existence:
  ```bash
  [ -n "$API_KEY" ] && echo "API_KEY is set" || echo "API_KEY is missing"
  ```
- Never use `echo $SECRET`, `printenv KEY`, or any command that outputs a value
- Never hardcode secrets in source files
- Never commit `.env` files (use `.env.example` as template)

### General
- Never use `service_role`, admin, server-only, or equivalent privileged keys on the client side
- Database, storage, and API access policies must be explicit — do not rely on default-open behavior
