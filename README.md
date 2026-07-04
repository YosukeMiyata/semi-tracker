# 半導体テーマトラッカー 2.0

個人投資家向けの半導体関連株情報サイト。v1(テーマ別騰落率トラッカー)を全面刷新し、
「価格データ(数字)× ニュース解説(文脈)」の統合をコアバリューとする。

- v1(原作): https://github.com/yuyu5555-bit/semi-tracker — 銘柄マスタ・テーマ分類・米日連動の
  基本ロジックは v1 を踏襲しています(作者: [yuyu5555-bit](https://github.com/yuyu5555-bit))
- v2 仕様書: `semi-tracker-v2-spec.md` / デザインプロトタイプ準拠

## 構成(モノレポ)

```
apps/web/      フロントエンド (TypeScript / React / React Router v7 SSG / Tailwind CSS v4)
pipeline/      データパイプライン (Python) — 銘柄マスタ・株価取得・集計
data/          サイトが読む JSON(生成物+手動編集の news.json 等)
```

## 銘柄・テーマの追加(v1 と同じ運用)

**`pipeline/themes.py` の `MACRO` を編集するだけ**で銘柄・テーマを追加できます(v1 と同じ)。
編集後に変換スクリプトを実行すると `data/themes.json` が再生成されます:

```sh
python3 pipeline/build_master.py   # または pnpm data:master
```

- 米国株: `["NVDA", "NVIDIA"]`
- 連動日本株: `["6857", "アドバンテスト", "連動理由"]`
- 日本単独: `["4186", "東京応化工業", "内容"]`

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
スキーマは同ファイル内の既存エントリを参照。感情スコア(sentiment)は
「ニュース論調の機械的な数値化」であり株価予測ではありません。

## 開発

```sh
pnpm install
pnpm dev          # http://localhost:5173/semi-tracker/
pnpm build        # 静的ビルド (apps/web/build/client)
pnpm typecheck
pnpm biome:check  # TS/JSON の lint + format 検査
```

Python 側の lint は [ruff](https://docs.astral.sh/ruff/) を使用(設定は `pipeline/pyproject.toml`)。

## デプロイ

GitHub Pages(`https://<user>.github.io/semi-tracker/`)。ビルドは `/semi-tracker/` を
base path として生成される。データ更新は GitHub Actions の平日日次バッチ(構築予定)。

## 免責

本サイトは公開情報の整理・ニュース論調の分析を提供するものであり、金融商品取引法上の
投資助言ではありません。投資判断はご自身の責任でお願いします。

データソース: 株価 = Stooq(主)/ Yahoo Finance(予備)。
