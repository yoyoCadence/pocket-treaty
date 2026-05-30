[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

---

# ポケット条約 Pocket Treaty

カップルや家族向けのモバイルファーストPWA — 交互に支払いをするときに「誰が誰にいくら借りているか」を自動で管理するアプリです。

---

## このアプリが解決する問題

彼女や家族と外食・買い物をするとき、どちらか一人が先に支払うことが多いですが、費用は折半するはずです。何度も繰り返すうちに「結局いくら借りてるんだっけ？」という状況になりがちです。ポケット条約は：

- 支払い者と割り勘方法を明記して支出を記録
- 「あなたは彼女に NT$250 借りている」などの純残高を自動計算
- 返済を記録すると残高がリアルタイムで更新
- すべての履歴を保持し、借りた理由を元の支出まで追跡できる
- PWAとしてオフラインで動作し、ホーム画面に追加してアプリのように使える

---

## 主な機能

- 素早い支出入力（目標：5〜10秒で完了）
- 柔軟な割り勘モード：均等割り、全額負担、カスタム金額
- 複数の支出・返済をまたいだリアルタイム精算計算
- ダッシュボード：今日・今週・今月の合計と現在の残高サマリー
- 精算ページ：純残高と詳細な内訳を表示
- 記録ページ：カテゴリ・支払い者・日付でフィルター
- 設定ページ：メンバー・カテゴリ・店舗の管理
- 支出・精算記録のCSVエクスポート
- PWA：iOSおよびAndroidにインストール可能、オフライン対応

---

## 技術スタック

| 層 | 選択 |
|---|---|
| ビルドツール | Vite |
| UI | React + TypeScript |
| スタイリング | Tailwind CSS |
| 状態管理 | Zustand |
| バックエンド | Supabase（フェーズ7以降） |
| グラフ | Recharts |
| 日付処理 | date-fns |
| PWA | vite-plugin-pwa |
| アイコン | lucide-react |

---

## 開発フェーズ

| フェーズ | 目標 | 状態 |
|---|---|---|
| 0 | ドキュメント初期化 | ✅ 完了 |
| 1 | 初回動作するモック版 | ✅ 完了 |
| 2 | 精算ロジック検証・返済UI | ✅ 完了 |
| 3 | 支出追加フロー | 未着手 |
| 4 | 記録の閲覧・編集 | 未着手 |
| 6 | UIの磨き込み | 未着手 |
| 7 | Supabase連携 | 未着手 |
| 8 | CSVエクスポート | 未着手 |
| 9 | スマート自動入力 | 未着手 |
| 10 | PWA + GitHub Pages デプロイ | 未着手 |

---

## ローカル開発環境

```bash
npm install
npm run dev       # 開発サーバー http://localhost:5173
npm run build     # プロダクションビルド
npm run preview   # プロダクションビルドのプレビュー
npm run lint      # コードチェック
```

---

## 環境変数

`.env.example` を `.env` にコピーして、Supabaseの認証情報を入力してください（フェーズ7以降で使用）：

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**`.env` は絶対にコミットしないでください。** クライアント側で `service_role` キーを使用しないでください。

---

## Supabaseの設定

完全なSQLスキーマは `tasks.md` のフェーズ7を参照してください。必要なテーブル：

- `profiles`、`people`、`categories`、`merchants`
- `expenses`、`expense_shares`、`settlements`

すべてのテーブルでRLSを有効にし、ユーザーは自分のデータのみ読み書きできます。

---

## デプロイ

対象プラットフォーム：GitHub Pages  
ベースパス：`/pocket-treaty/`（`vite.config.ts` で設定）

完全なデプロイ手順とGitHub Actions workflowはフェーズ10で完成します。

---

## PWAのインストール方法

- **iOS**：Safari → 共有 → ホーム画面に追加
- **Android**：Chrome → メニュー → ホーム画面に追加

新バージョンのデプロイ後、service workerが最新版への更新を促します。

---

## セキュリティ

- Supabase anonキーはフロントエンドに公開されますが、これは正常な設計です（GitHub Pagesは隠せない）
- セキュリティはSupabaseのRow Level Security (RLS) ポリシーに完全依存
- フロントエンドコードで `service_role` キーは絶対に使用しない
- `.env` ファイルは絶対にコミットしない
