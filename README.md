# Pocket Treaty（口袋條約）

A mobile-first PWA for expense tracking and split settlement — built for couples and families who take turns paying shared expenses.

---

## What It Does

Pocket Treaty solves a real daily problem: when you and your partner (or family) take turns paying for meals, drinks, and outings, it's hard to track who owes whom. This app:

- Records every expense with payer and split details
- Automatically calculates net balances (e.g., "you owe girlfriend NT$250")
- Lets you log repayments and see updated balances instantly
- Keeps full history so you can trace every debt back to the original expense
- Works offline-first as a PWA, installable to your phone's home screen

---

## Core Features

- Quick expense entry (designed for 5–10 second input)
- Flexible split modes: equal, single person, custom amounts
- Real-time debt calculation across multiple expenses and repayments
- Dashboard with today / week / month totals and current balance summary
- Settlement page showing net balance with full breakdown
- Records page with category / payer / date filters
- Settings for managing people, categories, merchants
- CSV export for expenses and settlements
- PWA: installable on iOS and Android, works offline

---

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| UI | React + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (if needed) |
| Backend | Supabase (Phase 7+) |
| Charts | Recharts |
| Dates | date-fns |
| PWA | vite-plugin-pwa |
| Icons | lucide-react |

---

## Development Phases

| Phase | Goal | Status |
|---|---|---|
| 0 | Documentation init | Done |
| 1 | First runnable mock version | In Progress |
| 2 | Settlement logic MVP | Backlog |
| 3 | Add Expense flow | Backlog |
| 4 | Records and editing | Backlog |
| 5 | Settlement page | Backlog |
| 6 | UI polish | Backlog |
| 7 | Supabase integration | Backlog |
| 8 | CSV export | Backlog |
| 9 | Smart autofill | Backlog |
| 10 | PWA + GitHub Pages deployment | Backlog |

---

## Local Setup

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # lint check
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials (Phase 7+):

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never commit `.env`.** Never use `service_role` key on the client.

---

## Supabase Setup

See Phase 7 in `tasks.md` for the full SQL schema. Tables required:

- `profiles`, `people`, `categories`, `merchants`
- `expenses`, `expense_shares`, `settlements`

All tables require RLS. Users can only read/write their own data.

---

## Deployment

Target: GitHub Pages  
Base path: `/pocket-treaty/` (configured in `vite.config.ts`)

Build and deploy instructions will be finalized in Phase 10, including a GitHub Actions workflow.

---

## PWA

The app is installable via "Add to Home Screen" on iOS Safari and Android Chrome.

Cache invalidation: when deploying new versions, the service worker will prompt users to refresh. See Phase 10 notes in `tasks.md` for cache strategy.

---

## Security

- Supabase anon key is public-facing by design (GitHub Pages frontend)
- Security is enforced entirely via Row Level Security (RLS) policies in Supabase
- Never use `service_role` key in frontend code
- Never commit `.env` files
