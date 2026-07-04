# 半導体テーマトラッカー

個人投資家向けの半導体関連株情報サイト。v1(テーマ別騰落率トラッカー)を全面刷新し、
「価格データ(数字)× ニュース解説(文脈)」の統合をコアバリューとする。

- v1(原作): https://github.com/yuyu5555-bit/semi-tracker — 銘柄マスタ・テーマ分類・米日連動の
  基本ロジックは v1 を踏襲しています(作者: [yuyu5555-bit](https://github.com/yuyu5555-bit))
- v2: モバイルファースト UI、ニュースセンチメント、サプライチェーンマップ、銘柄シート(テクニカル分析)を追加

## 構成(モノレポ)

```
apps/web/      フロントエンド (TypeScript / React 19 / React Router v7 SSG / Tailwind CSS v4)
pipeline/      データパイプライン (Python 3.12) — 銘柄マスタ・株価取得・集計
data/          サイトが読む JSON(生成物 + 手動編集の news.json 等)
.github/       CI — 平日データ更新・GitHub Pages デプロイ
```

## サイト構成(5タブ)

| タブ | パス | 内容 |
|------|------|------|
| ホーム | `/` | 週間センチメント(ウェハーマップ)、SOX指数、自動ヘッドライン、注目分析ニュース3本、米日連動サマリー |
| ニュース | `/news` | 自動ヘッドライン(13媒体)、センチメント定点観測(週次チャート)、分析ニュース一覧(フィルタ付)、地政学タイムライン |
| テーマ | `/themes` | v1 トラッカー相当 — 7ビュー(テーマ/銘柄分析/前日比・出来高/騰落率/フロー図/連動/工程)、銘柄検索・シート |
| マップ | `/map` | サプライチェーンマップ(4ステージ) — 装置\|材料の対比、今週の論点・ニュース件数 |
| 学ぶ | `/learn` | 用語辞典(HBM, CoWoS, EUV 等) — 「なぜ株価に効くか」まで解説 |

## テーママスタ(12マクロ × 59サブ)

`pipeline/themes.py` の `MACRO` が唯一の銘柄マスタ。現在の規模(2026-07 時点):

- マクロテーマ 12: メモリ・ストレージ / 光接続 / 先端パッケージング・基板 / 半導体製造装置(SPE) / 計算半導体 / アナログ・電源 / 受動部品 / データセンター / 半導体材料 / サブシステム / 半導体ファブ / 金属・レアアース
- サブテーマ 59、日本株 189、米国株 91

各サブテーマは **米国株(us) / 連動日本株(jp) / 日本単独(solo)** の3分類。

## 銘柄・テーマの追加(v1 と同じ運用)

**`pipeline/themes.py` の `MACRO` を編集するだけ**で銘柄・テーマを追加できます(v1 と同じ)。
編集後に変換スクリプトを実行すると `data/themes.json` が再生成されます:

```sh
python3 pipeline/build_master.py   # または pnpm data:master
python3 pipeline/build_maps.py     # または pnpm data:maps (工程・フロー図も再生成)
```

- 米国株: `["NVDA", "NVIDIA"]`
- 連動日本株: `["6857", "アドバンテスト", "連動理由"]`
- 日本単独: `["4186", "東京応化工業", "内容"]`

## データファイル一覧

### 自動生成(パイプライン)

| ファイル | 生成元 | 内容 |
|----------|--------|------|
| `prices.json` | `update_prices.py` | 銘柄別日足キャッシュ [date, close, volume](直近320営業日) |
| `themes_perf.json` | 同上 | マクロテーマ別: 年初来騰落率・スパークライン・出来高シグナル |
| `themes_detail.json` | 同上 | テーマ・サブテーマ・銘柄別の詳細騰落率 |
| `linkage.json` | 同上 | 米日連動の全集計 |
| `linkage_top.json` | 同上 | ホーム表示用の直近トリガー抜粋 |
| `indices.json` | 同上 | SOX指数など |
| `process.json` | 同上 / `build_maps.py` | 工程タブ(装置\|材料 2カラム) |
| `flow.json` | 同上 / `build_maps.py` | フロー図(5ステージ) |
| `timeline_stats.json` | 同上 | 地政学イベント後5営業日のテーマ騰落 |
| `update_report.json` | 同上 | 取得結果レポート(失敗銘柄・ソース内訳) |
| `headlines.json` | `fetch_headlines.py` | 13媒体の自動ヘッドライン |
| `themes.json` | `build_master.py` | 銘柄マスタ JSON 変換 |
| `stock_tags.json` | `pipeline/tags.py` | 銘柄タグ(検索用) |

### 手動編集

| ファイル | 内容 |
|----------|------|
| `news.json` | 分析ニュース(感情スコア −2〜+2、関連銘柄、影響チェーン) |
| `supplychain.json` | サプライチェーンマップ(4ステージ構成・今週の論点 topic) |
| `timeline.json` | 地政学タイムライン(規制イベント等) |
| `glossary.json` | 用語辞典 |

## 株価データパイプライン

```sh
python3 pipeline/update_prices.py                    # 全銘柄(日次バッチ本番)
python3 pipeline/update_prices.py --only 8035,NVDA   # 指定銘柄のみ(動作確認)
```

- **データソース**: Stooq(主) / Yahoo Finance(予備)。カナリア銘柄(8035)で事前チェックし、死んだソースはスキップ
- **失敗時の挙動**: 失敗銘柄が全体の 10% を超えた場合は一切書き込まず exit 1 → 前回 JSON を維持
- **集計**: テーマ騰落率 = 構成銘柄の単純平均(等ウェイト)。出来高急増 = 直近20日平均比 2×/3×/5×

## 米日連動分析

米国テーマ(構成銘柄の単純平均リターン)が前日 **+2% 以上** だった日について、
翌営業日の連動日本株リターンを過去データで集計した「陽性率」と「平均リターン」。
単純な条件付き集計(交絡調整なし、サンプル n≥5)。

## ニュースの二層構成

### 自動ヘッドライン(毎日 RSS 更新)

`pipeline/fetch_headlines.py` が平日バッチで `data/headlines.json` を生成します。
日経・Bloomberg・Reuters・CNBC・WSJ・日刊工業・東洋経済・日経xTECH・ITmedia・EE Times Japan・DigiTimes・SemiEngineering・Tom's Hardware から見出し+リンクを掲載(無料・AI なし)。

```sh
python3 pipeline/fetch_headlines.py   # または pnpm data:headlines
```

- **日経**: 日経電子版は公開 RSS がないため、Google News(`site:nikkei.com`) で半導体記事を取得
- **Bloomberg / CNBC / WSJ / Reuters**: Google News(`site:各媒体`) で半導体記事を取得(Reuters は公式 RSS 終了)
- **日経xTECH**: 日経クロステック RSS(半導体キーワードでフィルタ)
- **ITmedia**: TechFactory「エレクトロニクス」RSS
- **EE Times Japan**: 新着記事 RSS
- **DigiTimes**: 台湾発の半導体業界専門メディア RSS(キーワードでフィルタ)
- **SemiEngineering**: 半導体設計・製造の専門メディア RSS
- **日刊工業**: Google News(`site:nikkan.co.jp`) — 公開 RSS は取得不可のため
- **東洋経済**: Google News(`site:toyokeizai.net`)
- **Tom's Hardware**: 半導体タグ RSS(英語・ハードウェア/CPU/GPU 寄り)

### 分析ニュース(Phase 1: 手動運用)

`data/news.json` に 1 件追記して commit すればサイトに反映されます。
スキーマは同ファイル内の `_schema` および既存エントリを参照。感情スコア(sentiment)は
「ニュース論調の機械的な数値化」であり株価予測ではありません。

- **週間センチメント**: 直近7日の分析ニュース sentiment 平均(±2.0 スケール)
- **ウェハーマップ**: 12マクロテーマをダイで表示、直近7日のテーマ別 sentiment で着色
- **センチメント定点観測**: 月曜起点の週次平均スコア推移(12週)

## テーマタブ(7ビュー)

| ビュー | 内容 |
|--------|------|
| テーマ | 期間(1日〜年初来)・市場(統合/米国/日本)切替、累積騰落率チャート、マクロ→サブ→銘柄の階層表示 |
| 銘柄分析 | テクニカル指標(RSI, ボリンジャー, 乖離率等)による銘柄ランキング |
| 前日比・出来高 | 前日騰落率・出来高急増銘柄の一覧 |
| 騰落率 | 期間別騰落率ランキング |
| フロー図 | 5ステージの半導体フロー(設計→製造→…→利用)と関連銘柄 |
| 連動 | 米日連動の全テーマ一覧(トリガー段階 2%/5%/10%) |
| 工程 | 前工程/中工程/後工程の装置\|材料 2カラム表示 |

銘柄タップで **銘柄シート** が開き、終値・前日比・出来高率・価格チャート・テクニカル分析・所属テーマ・連動実績・外部リンク(株探/Yahoo/TradingView)を表示。

## 開発

```sh
pnpm install
pnpm dev          # http://localhost:5173/semi-tracker/
pnpm build        # 静的ビルド (apps/web/build/client)
pnpm typecheck
pnpm biome:check  # TS/JSON の lint + format 検査
```

Python 側の lint は [ruff](https://docs.astral.sh/ruff/) を使用(設定は `pipeline/pyproject.toml`)。

## デプロイ・自動更新

GitHub Pages(`https://<user>.github.io/semi-tracker/`)。ビルドは `/semi-tracker/` を
base path として生成される(`react-router.config.ts` / `vite.config.ts`)。

### GitHub Actions

| ワークフロー | トリガー | 内容 |
|-------------|---------|------|
| `update-data.yml` | 平日 JST 19:00 + 手動 | 株価取得→集計→headlines 取得→data/ commit & push |
| `deploy.yml` | main push + 手動 | Biome lint → 型チェック → SSG ビルド → data/ 同梱 → Pages デプロイ(最大3回リトライ) |

データ更新で commit されると `deploy.yml` が自動でサイトを再ビルドする。
headlines 取得が失敗しても株価更新は維持される(前回 headlines.json を残す)。

## 免責

本サイトは公開情報の整理・ニュース論調の分析を提供するものであり、金融商品取引法上の
投資助言ではありません。投資判断はご自身の責任でお願いします。

データソース: 株価 = Stooq(主)/ Yahoo Finance(予備)。
