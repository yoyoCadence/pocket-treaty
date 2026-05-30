# Tasks — Pocket Treaty

Lightweight task board. See AGENTS.md §8 for lifecycle rules.

---

## Next

- [ ] Phase 10: PWA manifest + GitHub Pages base path + deploy workflow
- [ ] 新增功能時補充對應測試（規則：純邏輯必測，UI component 暫緩）

---

## In Progress

---

## Backlog

### Phase 4: Records and Editing
- [ ] RecordsPage: filter by category, payer, date range
- [ ] Delete expense (cascade remove shares)
- [ ] Edit expense (sync shares on update)
- [ ] Duplicate similar record shortcut

### Phase 5: Settlement Page Complete ✅ (pulled forward)
- [x] Display directional net balance with colour coding (red = I owe, green = I'm owed)
- [x] Show expense breakdown with direction arrows and +/- labels
- [x] Gross subtotal bar (欠出 / 收回 / 已還)
- [x] Add repayment form with quick-fill buttons and note field
- [x] Settlement history list (collapsible after 3 items)
- [x] Balance updates immediately after adding repayment

### Phase 6: UI Polish
- [ ] Soft finance dashboard style (background #F7F4EF, cards white, primary #2F4F4F, accent #D9A441)
- [ ] Beautiful Dashboard cards with clear amount hierarchy
- [ ] Polished AddExpense form (mobile-friendly inputs)
- [ ] Empty states for all pages
- [ ] lucide-react icons throughout
- [ ] Toast / feedback on save/delete actions
- [ ] Loading/saving states
- [ ] Confirm mobile viewport is comfortable (bottom nav doesn't cover content)

### Phase 7: Supabase Integration
- [ ] Create .env (from .env.example) — already created .env.example
- [ ] Uncomment and configure src/lib/supabase.ts
- [ ] Write Supabase SQL schema (profiles, people, categories, merchants, expenses, expense_shares, settlements)
- [ ] Write RLS policies (user can only read/write own data)
- [ ] Replace Zustand mock store with Supabase reads/writes
- [ ] Basic error handling for failed Supabase calls
- [ ] Update README.md with Supabase setup steps

### Phase 8: CSV Export
- [ ] Implement src/lib/csv.ts (exportExpenses, exportSettlements)
- [ ] Export expenses CSV with human-readable columns (no raw IDs)
- [ ] Export settlements CSV
- [ ] Add export buttons to SettingsPage
- [ ] Filename includes current date

### Phase 9: Smart Autofill
- [ ] Expand src/lib/autofill.ts (category by merchant history, payer/split from history)
- [ ] Show suggestions in AddExpensePage with one-tap apply

### Phase 10: PWA + GitHub Pages Deployment
- [ ] Install and configure vite-plugin-pwa (already in package.json)
- [ ] Create PWA manifest (name, icons placeholder, theme color, display: standalone)
- [ ] Set vite base path to /pocket-treaty/ for GitHub Pages
- [ ] Create placeholder app icons (192x192, 512x512)
- [ ] Write GitHub Actions deploy workflow (.github/workflows/deploy.yml)
- [ ] Document mobile Add to Home Screen steps in README.md
- [ ] Document PWA cache invalidation strategy

---

## Done

### Phase 0: Documentation Init
- [x] Read existing starter template files (README.md, AGENTS.md, tasks.md, .gitignore)
- [x] Update AGENTS.md Section 0 — Pocket Treaty project context filled
- [x] Update AGENTS.md Section 0.1 — current technical state noted
- [x] Rebuild tasks.md — phased task structure created
- [x] Update README.md — Pocket Treaty project README written

### Phase 1: First Runnable Mock Version
- [x] Initialize Vite + React + TypeScript project (package.json, vite.config.ts, tsconfig.json, index.html)
- [x] Configure Tailwind CSS (tailwind.config.js, postcss.config.js, src/styles/index.css)
- [x] Create TypeScript types in src/types/database.ts (Person, Category, Merchant, Expense, ExpenseShare, Settlement, DebtEntry, BalanceSummary)
- [x] Create mock data in src/data/mockData.ts (3 expenses + 1 settlement → expected net NT$170)
- [x] Implement settlement calculation in src/lib/settlement.ts (calculateExpenseDebts, calculateNetBalances, getBalanceBetween, formatBalanceSummary, getSettlementDetails, formatCurrency, sumExpensesInRange)
- [x] Create Zustand store in src/stores/useAppStore.ts (mock data + addExpense, deleteExpense, addSettlement)
- [x] Create base mobile app shell (src/main.tsx, src/app/App.tsx, src/components/layout/BottomNav.tsx)
- [x] Build DashboardPage with today/week/month totals, balance card, recent records list
- [x] Build AddExpensePage with real-time split preview and save to store
- [x] Build SettlementPage with net balance + breakdown + settlement history
- [x] Build RecordsPage with all expenses sorted by date
- [x] Build SettingsPage with people, categories, merchants, export stubs
- [x] Create lib stubs (src/lib/autofill.ts, src/lib/csv.ts, src/lib/supabase.ts, src/lib/date.ts)
- [x] Verify: npm install ✓, npm run build ✓ (TypeScript clean, 224KB JS bundle)

### Phase 2 + Phase 5: Settlement Logic & Repayment UI ✅
- [x] Verified settlement.ts: A=250, B=60, C=190, D=170 all correct (net NT$170)
- [x] SettlementPage shows directional breakdown per expense (紅=我欠出, 綠=別人欠我)
- [x] Gross subtotal bar shows 欠出 / 收回 / 已還 三欄
- [x] Repayment form: amount input + quick-fill buttons + note + 確認還款
- [x] Settlement history list (collapsible after 3 items)
- [x] Balance card and breakdown update immediately after adding repayment
- [x] npm run build ✓ (TypeScript clean, 230KB JS bundle)

### Phase 3 + Phase 4: Edit / Filter / Delete ✅
- [x] AddExpensePage: edit mode via /edit/:id — pre-fills all fields, calls updateExpense
- [x] AddExpensePage: shows warning banner if editing expense that already has shares
- [x] Store: updateExpense action atomically replaces expense + shares
- [x] RecordsPage: category filter chips (全部 + 10 categories)
- [x] RecordsPage: payer filter chips (全部 / 我 / 女友)
- [x] RecordsPage: collapsible filter panel, active count badge
- [x] RecordsPage: pencil icon → /edit/:id navigation
- [x] RecordsPage: trash icon → bottom-sheet confirmation (mobile-friendly)
- [x] RecordsPage: delete cascades to expense_shares in store
- [x] npm run build ✓ (TypeScript clean, 236KB JS bundle)

### Tests: settlement.ts + autofill.ts ✅
- [x] Install Vitest + @vitest/coverage-v8
- [x] Configure vite.config.ts (test environment, coverage include/exclude)
- [x] Add npm scripts: test / test:run / test:coverage
- [x] settlement.test.ts — 39 tests covering:
  - calculateExpenseDebts (5 cases: equal, payer exclusion, single_person, none, zero share)
  - calculateNetBalances (7 cases: A/B/C/D scenarios, mock data 170, settled, overpaid)
  - getBalanceBetween symmetry
  - getSettlementDetails (3 cases: breakdown count, third-party exclusion, 3-person group)
  - formatBalanceSummary (6 cases: I owe, other owes, settled, large amount, third party, unknown id fallback)
  - formatCurrency (4 cases: normal, thousands, negative, zero)
  - sumExpensesInRange (6 cases: range, start boundary, end boundary, outside, empty, all)
- [x] autofill.test.ts — 14 tests covering all time slots + boundaries + valid categoryId check
- [x] 53 tests, all passing
- [x] settlement.ts coverage: 100% Stmts / 100% Branch / 100% Funcs / 100% Lines
