[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

---

# 口袋條約 Pocket Treaty

專為情侶、家人設計的 Mobile-first PWA 記帳與分帳 APP — 解決輪流付款時不知道誰欠誰多少的日常問題。

---

## 這個 APP 解決什麼問題

和女友或家人出去吃飯、買飲料、購物，通常只有一個人先付款，但費用應該共同負擔。久了就搞不清楚誰欠誰多少。口袋條約：

- 記錄每一筆支出，清楚標記付款者與分帳方式
- 自動計算淨額（例如：「你欠女友 NT$250」）
- 輸入還款後即時更新餘額
- 保留完整明細，每一筆欠款都能追溯來源
- 支援 PWA 離線使用，可加到手機桌面像 APP 一樣開啟

---

## 核心功能

- 快速記帳（設計目標：5–10 秒完成輸入）
- 彈性分帳模式：平分、單人負擔、自訂金額
- 跨多筆支出與還款的即時債務計算
- Dashboard 顯示今日 / 本週 / 本月總支出與目前結算狀態
- 結算頁面顯示淨額與完整欠款明細
- 明細頁面支援類別 / 付款者 / 日期篩選
- 設定頁管理成員、類別、商家
- 支出與結算紀錄 CSV 匯出
- PWA：可安裝至 iOS 和 Android，支援離線使用

---

## 技術棧

| 層級 | 選擇 |
|---|---|
| 建置工具 | Vite |
| UI | React + TypeScript |
| 樣式 | Tailwind CSS |
| 狀態管理 | Zustand |
| 後端 | Supabase（Phase 7 起） |
| 圖表 | Recharts |
| 日期處理 | date-fns |
| PWA | vite-plugin-pwa |
| 圖示 | lucide-react |

---

## 開發階段

| 階段 | 目標 | 狀態 |
|---|---|---|
| 0 | 文件初始化 | ✅ 完成 |
| 1 | 第一個可執行 Mock 版本 | ✅ 完成 |
| 2 | 分帳邏輯驗證 + 還款 UI | ✅ 完成 |
| 3 | 新增支出完整流程 | 待開始 |
| 4 | 明細查詢與編輯 | 待開始 |
| 6 | UI 精修 | 待開始 |
| 7 | Supabase 整合 | 待開始 |
| 8 | CSV 匯出 | 待開始 |
| 9 | 智慧自動填入 | 待開始 |
| 10 | PWA + GitHub Pages 部署 | 待開始 |

---

## 本地開發

```bash
npm install
npm run dev       # 開發伺服器 http://localhost:5173
npm run build     # 生產建置
npm run preview   # 預覽生產建置
npm run lint      # 程式碼檢查
```

---

## 環境變數

複製 `.env.example` 為 `.env`，填入 Supabase 憑證（Phase 7 起使用）：

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**絕對不能 commit `.env`。** 絕對不能在前端使用 `service_role` key。

---

## Supabase 設定

完整 SQL schema 請見 `tasks.md` Phase 7 說明。需要的資料表：

- `profiles`、`people`、`categories`、`merchants`
- `expenses`、`expense_shares`、`settlements`

所有資料表必須啟用 RLS，使用者只能讀寫自己的資料。

---

## 部署

目標平台：GitHub Pages  
Base path：`/pocket-treaty/`（在 `vite.config.ts` 設定）

完整部署說明與 GitHub Actions workflow 將於 Phase 10 完成。

---

## PWA 安裝

- **iOS**：Safari → 分享 → 加入主畫面
- **Android**：Chrome → 選單 → 新增至主畫面

新版本部署後，service worker 會提示使用者重新整理以取得最新版本。

---

## 安全性

- Supabase anon key 公開在前端是正常設計（GitHub Pages 前端無法隱藏）
- 安全性完全依賴 Supabase Row Level Security (RLS) 政策
- 前端程式碼中絕對不使用 `service_role` key
- 絕對不 commit `.env` 檔案
