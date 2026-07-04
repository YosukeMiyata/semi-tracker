#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""日次バッチ: 株価取得 → バリデーション → 集計 → data/*.json 生成(仕様書 4.1〜4.3)。

生成物:
  data/prices.json       銘柄別日足キャッシュ [date, close, volume](直近 KEEP_DAYS 本)
  data/themes_perf.json  マクロテーマ別: 年初来騰落率・スパークライン・出来高シグナル
  data/linkage.json      米日連動の全集計(v1 ロジック踏襲)
  data/linkage_top.json  ホーム表示用の上位抜粋(直近トリガー分)
  data/process.json      工程タブ(装置|材料 2カラム、process_map.py 由来)
  data/flow.json         フロー図(5ステージ、flow_map.py 由来)
  data/update_report.json 取得結果レポート(ソース内訳・失敗銘柄)

失敗時の挙動(仕様書 4.1):
  失敗銘柄が FAIL_THRESHOLD を超えた場合は一切書き込まず exit 1
  → 前回生成の JSON が維持され、GitHub Actions が失敗通知を出す。

実行例:
  python3 pipeline/update_prices.py                    # 全銘柄
  python3 pipeline/update_prices.py --only 8035,NVDA   # 指定銘柄のみ(動作確認用)
  python3 pipeline/update_prices.py --disable stooq    # ソース停止テスト(受け入れ基準)
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fetchers import (  # noqa: E402
    StooqFetcher,
    YahooChartFetcher,
    fetch_with_fallback,
    validate_series,
)
from build_maps import build as build_maps  # noqa: E402
from linkage import METHOD_NOTE, build_linkage  # noqa: E402
from themes import MACRO, all_symbols  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
KEEP_DAYS = 320  # 米日連動(250営業日)+ ウォームアップ分
SPARK_DAYS = 63  # スパークライン: 直近3ヶ月(営業日)
FAIL_THRESHOLD = 0.10  # 失敗が全体の10%を超えたら書き込まず異常終了
SLEEP_SEC = 0.8

# 銘柄マスタ(themes.py)外の追加取得シンボル: 指数など
EXTRA_SYMBOLS = {
    "^SOX": ("SOX指数", "us"),
}


PROBE_SYMBOL = ("8035", "jp")  # カナリア: 東京エレクトロン


def probe_fetchers(fetchers: list) -> tuple[list, list[str]]:
    """各ソースをカナリア銘柄で事前チェックし、死んでいるソースをランから外す。

    Stooq は 2026-07 時点で CSV エンドポイントに JS ボット検証がかかることがあり、
    その場合 282 銘柄すべてで無駄な失敗リトライが走るのを避ける。
    """
    active, disabled = [], []
    for f in fetchers:
        rows = f.fetch(*PROBE_SYMBOL)
        problems = validate_series(rows, today=date.today())
        if problems:
            print(
                f"** 事前チェックNG: {f.name}({', '.join(problems)})— このランでは使用しない",
                file=sys.stderr,
            )
            disabled.append(f.name)
        else:
            active.append(f)
    return active, disabled


def fetch_all(symbols: dict, fetchers: list, sleep_sec: float) -> tuple[dict, list, dict]:
    quotes: dict = {}
    failed: list[str] = []
    src_count: dict[str, int] = {}
    total = len(symbols)
    for i, (sym, (name, market)) in enumerate(symbols.items()):
        rows, src, notes = fetch_with_fallback(fetchers, sym, market, today=date.today())
        for note in notes:
            print(f"  [{sym}] {note}", file=sys.stderr)
        if not rows:
            print(f"  !! {sym} {name}: 全ソース失敗", file=sys.stderr)
            failed.append(sym)
        else:
            src_count[src] = src_count.get(src, 0) + 1
            daily = [[r[0], round(r[1], 4), int(r[2])] for r in rows[-KEEP_DAYS:]]
            quotes[sym] = {"name": name, "market": market, "daily": daily}
        if (i + 1) % 25 == 0 or i + 1 == total:
            print(f"[{i + 1}/{total}] 取得済み(失敗 {len(failed)})")
        time.sleep(sleep_sec)
    return quotes, failed, src_count


def _ytd_pct(daily: list, year: str) -> float | None:
    """年初来騰落率(%)。1月中に取引データがある銘柄のみ対象。"""
    base = next((r for r in daily if r[0] >= f"{year}-01-01"), None)
    if base is None or base[0] > f"{year}-01-31" or not base[1]:
        return None
    return (daily[-1][1] / base[1] - 1) * 100


def _chg_pct(daily: list) -> float | None:
    """前日比(%)"""
    if len(daily) < 2 or not daily[-2][1]:
        return None
    return (daily[-1][1] / daily[-2][1] - 1) * 100


def _theme_ytd_series(quotes: dict, codes: list[str], year: str) -> list:
    """テーマの年初来累積騰落率の日次系列(等ウェイト)。[[date, pct], ...]"""
    cum_by_member = []
    for code in codes:
        q = quotes.get(code)
        if not q or not q["daily"]:
            continue
        daily = q["daily"]
        base = next((r for r in daily if r[0] >= f"{year}-01-01"), None)
        if base is None or base[0] > f"{year}-01-31" or not base[1]:
            continue
        cum_by_member.append(
            {r[0]: (r[1] / base[1] - 1) * 100 for r in daily if r[0] >= base[0]}
        )
    if not cum_by_member:
        return []
    dates = sorted(set().union(*[set(c) for c in cum_by_member]))
    series = []
    for d in dates:
        vals = [c[d] for c in cum_by_member if d in c]
        if vals:
            series.append([d, round(sum(vals) / len(vals), 2)])
    return series


def _vol_ratio(daily: list) -> float | None:
    """出来高シグナル: 当日出来高 ÷ 過去20日平均(v1 の式を踏襲)。"""
    vols = [r[2] for r in daily]
    if len(vols) < 2:
        return None
    past = vols[-21:-1] if len(vols) > 21 else vols[:-1]
    avg = sum(past) / len(past) if past else 0
    return round(vols[-1] / avg, 2) if avg else None


def build_themes_perf(quotes: dict, last_updated: str) -> dict:
    year = last_updated[:4]
    themes = []
    for m in MACRO:
        codes: dict[str, str] = {}
        for sub in m["subs"]:
            for row in list(sub["jp"]) + list(sub["solo"]):
                codes.setdefault(row[0], row[1])

        ytds, ratios, cum_by_member = [], [], []
        n_ok = 0
        for code in codes:
            q = quotes.get(code)
            if not q or not q["daily"]:
                continue
            n_ok += 1
            daily = q["daily"]
            y = _ytd_pct(daily, year)
            if y is not None:
                ytds.append(y)
            vr = _vol_ratio(daily)
            if vr is not None:
                ratios.append(vr)
            window = daily[-SPARK_DAYS:]
            if len(window) >= SPARK_DAYS // 2 and window[0][1]:
                base = window[0][1]
                cum_by_member.append({r[0]: (r[1] / base - 1) * 100 for r in window})

        spark: list[float] = []
        if cum_by_member:
            dates = sorted(set().union(*[set(c) for c in cum_by_member]))[-SPARK_DAYS:]
            for d in dates:
                vals = [c[d] for c in cum_by_member if d in c]
                if vals:
                    spark.append(round(sum(vals) / len(vals), 2))

        themes.append(
            {
                "key": m["key"],
                "name": m["name"],
                "color": m["color"],
                "ytd_pct": round(sum(ytds) / len(ytds), 1) if ytds else None,
                "vol_ratio": round(statistics.median(ratios), 2) if ratios else None,
                "spark": spark,
                "n_stocks": len(codes),
                "n_ok": n_ok,
            }
        )
    themes.sort(key=lambda t: (t["ytd_pct"] is None, -(t["ytd_pct"] or 0)))
    return {
        "last_updated": last_updated,
        "note": "年初来騰落率=構成銘柄の単純平均。出来高=当日÷20日平均の中央値。スパークライン=直近3ヶ月の累積騰落率(等ウェイト)",
        "themes": themes,
    }


def build_themes_detail(quotes: dict, last_updated: str) -> dict:
    """テーマタブ用の詳細データ: 年初来累積騰落率の系列+サブテーマ→銘柄のドリルダウン。"""
    year = last_updated[:4]
    themes = []
    for m in MACRO:
        codes: dict[str, str] = {}
        for sub in m["subs"]:
            for row in list(sub["jp"]) + list(sub["solo"]):
                codes.setdefault(row[0], row[1])
        series = _theme_ytd_series(quotes, list(codes), year)

        subs = []
        for sub in m["subs"]:
            stocks = []
            seen: set[str] = set()
            for row in list(sub["jp"]) + list(sub["solo"]):
                code, name = row[0], row[1]
                if code in seen:
                    continue
                seen.add(code)
                q = quotes.get(code)
                if not q or not q["daily"]:
                    continue
                y = _ytd_pct(q["daily"], year)
                stocks.append(
                    {
                        "code": code,
                        "name": name,
                        "ytd_pct": round(y, 1) if y is not None else None,
                        "chg_pct": (lambda c: round(c, 2) if c is not None else None)(
                            _chg_pct(q["daily"])
                        ),
                        "vol_ratio": _vol_ratio(q["daily"]),
                    }
                )
            if not stocks:
                continue
            stocks.sort(key=lambda s: (s["ytd_pct"] is None, -(s["ytd_pct"] or 0)))
            ytds = [s["ytd_pct"] for s in stocks if s["ytd_pct"] is not None]
            subs.append(
                {
                    "name": sub["name"],
                    "ytd_pct": round(sum(ytds) / len(ytds), 1) if ytds else None,
                    "stocks": stocks,
                }
            )
        subs.sort(key=lambda s: (s["ytd_pct"] is None, -(s["ytd_pct"] or 0)))

        themes.append(
            {
                "key": m["key"],
                "name": m["name"],
                "color": m["color"],
                "ytd_pct": series[-1][1] if series else None,
                "series": series,
                "subs": subs,
            }
        )
    return {
        "last_updated": last_updated,
        "note": "累積騰落率=構成銘柄の年初来リターンの単純平均(日次)。銘柄の並びは年初来騰落率順",
        "themes": themes,
    }


def build_indices(quotes: dict, last_updated: str) -> dict:
    """指数データ(SOX 等)。無料で取得できる範囲の市場指標。"""
    year = last_updated[:4]
    indices = []
    for sym, (name, _market) in EXTRA_SYMBOLS.items():
        q = quotes.get(sym)
        if not q or not q["daily"]:
            continue
        daily = q["daily"]
        window = daily[-SPARK_DAYS:]
        spark = []
        if len(window) >= 2 and window[0][1]:
            base = window[0][1]
            spark = [round((r[1] / base - 1) * 100, 2) for r in window]
        y = _ytd_pct(daily, year)
        c = _chg_pct(daily)
        indices.append(
            {
                "id": sym,
                "name": name,
                "last": round(daily[-1][1], 2),
                "date": daily[-1][0],
                "chg_pct": round(c, 2) if c is not None else None,
                "ytd_pct": round(y, 1) if y is not None else None,
                "spark": spark,
            }
        )
    return {"last_updated": last_updated, "indices": indices}


def build_timeline_stats(themes_detail: dict, last_updated: str) -> dict:
    """地政学タイムラインの各イベント後の関連テーマ株価反応(+5営業日)。

    timeline.json の tags(テーマ key)と日付(YYYY-MM-DD のもののみ)を使い、
    テーマ累積騰落率系列からイベント直前終値→5営業日後の変化率を計算する。
    """
    timeline_path = DATA_DIR / "timeline.json"
    if not timeline_path.exists():
        return {"last_updated": last_updated, "reactions": {}}
    timeline = json.loads(timeline_path.read_text(encoding="utf-8"))
    series_by_key = {t["key"]: t["series"] for t in themes_detail["themes"]}

    reactions: dict = {}
    for item in timeline.get("items", []):
        date = item.get("date", "")
        tags = item.get("tags", [])
        if len(date) != 10 or not tags:
            continue  # YYYY-MM 形式(日付不明)のイベントは対象外
        for tag in tags:
            series = series_by_key.get(tag)
            if not series:
                continue
            idx = max((i for i, r in enumerate(series) if r[0] <= date), default=None)
            if idx is None or idx + 5 >= len(series):
                continue
            c0 = series[idx][1]
            c5 = series[idx + 5][1]
            pct = ((1 + c5 / 100) / (1 + c0 / 100) - 1) * 100
            reactions.setdefault(date, {})[tag] = round(pct, 1)
    return {"last_updated": last_updated, "reactions": reactions}


def build_linkage_top(linkage: dict, last_updated: str, top_n: int = 3) -> dict:
    """ホーム用: 直近トリガー(米国テーマ+2%超)したサブテーマの最良行を上位 N 件。"""
    candidates = []
    for theme_name, entry in linkage.items():
        if not entry["triggered"] or not entry["rows"]:
            continue
        best = entry["rows"][0]
        candidates.append(
            {
                "theme": theme_name,
                "us_avg": entry["usAvg"],
                "trig_level": entry["trigLevel"],
                "code": best["code"],
                "name": best["name"],
                "rate": best["rate"],
                "avg": best["avg"],
                "n": best["n"],
            }
        )
    candidates.sort(key=lambda x: (x["rate"], x["avg"]), reverse=True)
    return {
        "last_updated": last_updated,
        "method": METHOD_NOTE,
        "rows": candidates[:top_n],
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="カンマ区切りの銘柄コード(動作確認用)")
    ap.add_argument("--disable", choices=["stooq", "yahoo"], help="指定ソースを無効化(テスト用)")
    ap.add_argument("--sleep", type=float, default=SLEEP_SEC)
    args = ap.parse_args()

    fetchers = [StooqFetcher(), YahooChartFetcher()]
    if args.disable:
        fetchers = [f for f in fetchers if f.name != args.disable]
        print(f"** {args.disable} を無効化(フォールバックテスト)", file=sys.stderr)
    fetchers, sources_disabled = probe_fetchers(fetchers)
    if not fetchers:
        print("!! 全ソースが事前チェックNG。前回データを維持して異常終了します。", file=sys.stderr)
        sys.exit(1)

    symbols = all_symbols()
    symbols.update(EXTRA_SYMBOLS)
    if args.only:
        wanted = {s.strip() for s in args.only.split(",")}
        symbols = {k: v for k, v in symbols.items() if k in wanted}
        if not symbols:
            sys.exit("--only に一致する銘柄がありません")

    started = datetime.now(timezone.utc)
    quotes, failed, src_count = fetch_all(symbols, fetchers, args.sleep)

    fail_rate = len(failed) / len(symbols) if symbols else 1.0
    if fail_rate > FAIL_THRESHOLD:
        print(
            f"!! 失敗率 {fail_rate:.0%}({len(failed)}/{len(symbols)})が閾値超過。"
            "前回データを維持して異常終了します。",
            file=sys.stderr,
        )
        sys.exit(1)

    jp_dates = [q["daily"][-1][0] for q in quotes.values() if q["market"] == "jp" and q["daily"]]
    last_updated = max(jp_dates) if jp_dates else date.today().isoformat()

    themes_perf = build_themes_perf(quotes, last_updated)
    themes_detail = build_themes_detail(quotes, last_updated)
    indices = build_indices(quotes, last_updated)
    timeline_stats = build_timeline_stats(themes_detail, last_updated)
    linkage = build_linkage(MACRO, quotes)
    linkage_out = {"last_updated": last_updated, "method": METHOD_NOTE, "themes": linkage}
    linkage_top = build_linkage_top(linkage, last_updated)
    process_payload, flow_payload = build_maps()
    report = {
        "generated_at": started.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "last_updated": last_updated,
        "symbols": len(symbols),
        "ok": len(quotes),
        "failed": failed,
        "sources": src_count,
        "sources_disabled": sources_disabled,
        "elapsed_sec": round((datetime.now(timezone.utc) - started).total_seconds()),
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    outputs = {
        "prices.json": {"last_updated": last_updated, "quotes": quotes},
        "themes_perf.json": themes_perf,
        "themes_detail.json": themes_detail,
        "indices.json": indices,
        "timeline_stats.json": timeline_stats,
        "linkage.json": linkage_out,
        "linkage_top.json": linkage_top,
        "process.json": process_payload,
        "flow.json": flow_payload,
        "update_report.json": report,
    }
    for fname, payload in outputs.items():
        path = DATA_DIR / fname
        path.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {path.name} ({path.stat().st_size / 1024:.0f} KB)")

    print(
        f"完了: {len(quotes)}/{len(symbols)} 銘柄(ソース内訳 {src_count} / 失敗 {len(failed)})"
        f" / データ基準日 {last_updated}"
    )


if __name__ == "__main__":
    main()
