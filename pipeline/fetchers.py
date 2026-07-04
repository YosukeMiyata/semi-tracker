# -*- coding: utf-8 -*-
"""株価取得層 — ソース非依存の PriceFetcher 抽象化(仕様書 4.1)。

v1 (https://github.com/yuyu5555-bit/semi-tracker) で実績のある取得方法を踏襲する:
- Stooq: キー不要の CSV エンドポイント(stooq.com → stooq.pl の順に試行)
- Yahoo: v8 chart API を直接叩く(yfinance 不使用。依存ゼロで同等の調整済み日足が取れる)

正規化済み行フォーマット: (date "YYYY-MM-DD", close, volume, open, high, low)
すべてのフェッチャーは失敗時に None を返し、例外を外に漏らさない。
両ソースとも「失敗時に例外ではなく空データを返す」性質があるため、
取得後は必ず validate_series() を通し、NG ならフォールバックする。
"""

from __future__ import annotations

import csv
import io
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone

Row = tuple[str, float, float, float, float, float]

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)


def _http_get(url: str, timeout: int = 30) -> str:
    headers = {
        "User-Agent": UA,
        "Accept": "text/csv,application/json,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")


class StooqFetcher:
    """Stooq 無料日足(キー不要エンドポイント)。日本株は1営業日ラグの報告あり。"""

    name = "stooq"

    @staticmethod
    def symbol(sym: str, market: str) -> str:
        return f"{sym.lower()}.jp" if market == "jp" else f"{sym.lower()}.us"

    def fetch(self, sym: str, market: str) -> list[Row] | None:
        ssym = self.symbol(sym, market)
        for host in ("stooq.com", "stooq.pl"):
            url = f"https://{host}/q/d/l/?s={ssym}&i=d"
            for _ in range(2):
                try:
                    text = _http_get(url)
                except Exception:
                    time.sleep(0.8)
                    continue
                rows = list(csv.reader(io.StringIO(text)))
                if len(rows) < 2 or "Date" not in rows[0][0]:
                    # キー要求・利用上限などは 200 OK のプレーンテキストで返るため、
                    # 先頭 100 文字をログに出して検知可能にする(仕様書 4.1)
                    head = text[:100].replace("\n", " ")
                    print(f"  stooq {ssym}: 非CSV応答: {head!r}", file=sys.stderr)
                    time.sleep(0.8)
                    continue
                out: list[Row] = []
                for row in rows[1:]:
                    if len(row) < 6:
                        continue
                    try:
                        # CSV列: Date,Open,High,Low,Close,Volume
                        out.append(
                            (
                                row[0],
                                float(row[4]),
                                float(row[5]),
                                float(row[1]),
                                float(row[2]),
                                float(row[3]),
                            )
                        )
                    except ValueError:
                        continue  # "N/D" 等の非数値行を除外
                out.sort(key=lambda x: x[0])
                if out:
                    return out
        return None


class YahooChartFetcher:
    """Yahoo Finance v8 chart API。調整後終値を優先(分割調整=Stooqと整合)。"""

    name = "yahoo"

    @staticmethod
    def symbol(sym: str, market: str) -> str:
        return f"{sym}.T" if market == "jp" else sym

    def fetch(self, sym: str, market: str) -> list[Row] | None:
        ysym = self.symbol(sym, market)
        for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
            url = (
                f"https://{host}/v8/finance/chart/{urllib.parse.quote(ysym, safe='')}"
                f"?range=2y&interval=1d&includeAdjustedClose=true"
            )
            out = self._fetch_one(url)
            if out:
                return out
            time.sleep(2)  # 429/一時失敗対策: ホスト切替前に少し待つ
        return None

    @staticmethod
    def _fetch_one(url: str) -> list[Row] | None:
        try:
            data = json.loads(_http_get(url))
            res = data["chart"]["result"][0]
            ts = res["timestamp"]
            q = res["indicators"]["quote"][0]
            closes = q["close"]
            vols = q.get("volume") or [None] * len(ts)
            opens = q.get("open") or [None] * len(ts)
            highs = q.get("high") or [None] * len(ts)
            lows = q.get("low") or [None] * len(ts)
            try:
                adj = res["indicators"]["adjclose"][0]["adjclose"]
            except Exception:
                adj = None
            out: list[Row] = []
            for i, t in enumerate(ts):
                raw_c = closes[i] if (i < len(closes) and closes[i] is not None) else None
                c = None
                if adj and i < len(adj) and adj[i] is not None:
                    c = adj[i]
                elif raw_c is not None:
                    c = raw_c
                if c is None:
                    continue  # 未確定・欠損日はスキップ
                v = vols[i] if (i < len(vols) and vols[i] is not None) else 0.0
                ratio = (c / raw_c) if (raw_c and raw_c > 0) else 1.0
                o = opens[i] * ratio if (i < len(opens) and opens[i] is not None) else c
                h = highs[i] * ratio if (i < len(highs) and highs[i] is not None) else c
                lo = lows[i] * ratio if (i < len(lows) and lows[i] is not None) else c
                d = datetime.fromtimestamp(t, tz=timezone.utc).strftime("%Y-%m-%d")
                out.append((d, float(c), float(v), float(o), float(h), float(lo)))
            out.sort(key=lambda x: x[0])
            # 末尾が出来高0の未確定バーなら除く(場中の不完全データ対策)。
            # 指数(^SOX 等)は全行が出来高0なので、出来高を持つ銘柄に限る
            if any(r[2] for r in out):
                while len(out) >= 2 and out[-1][2] == 0:
                    out.pop()
            return out or None
        except Exception:
            return None


def validate_series(
    rows: list[Row] | None,
    *,
    today: date,
    max_lag_days: int = 6,
    min_rows: int = 10,
) -> list[str]:
    """取得後バリデーション(仕様書 4.1・両ソース共通)。問題のリストを返す(空=OK)。"""
    if not rows:
        return ["empty"]
    problems: list[str] = []
    if len(rows) < min_rows:
        problems.append(f"rows={len(rows)} (<{min_rows})")
    try:
        latest = datetime.strptime(rows[-1][0], "%Y-%m-%d").date()
        gap = (today - latest).days
        if gap > max_lag_days:
            problems.append(f"stale: 最新 {rows[-1][0]} ({gap}日前)")
    except ValueError:
        problems.append(f"bad-date: {rows[-1][0]!r}")
    last_close = rows[-1][1]
    if not (last_close > 0):
        problems.append(f"bad-close: {last_close!r}")
    return problems


def fetch_with_fallback(
    fetchers: list,
    sym: str,
    market: str,
    *,
    today: date,
) -> tuple[list[Row] | None, str | None, list[str]]:
    """各フェッチャーを順に試し、バリデーション OK の最初の結果を返す。

    全ソースが NG でもデータ自体はある場合は「最新日付が新しい方」を採用する
    (v1 の挙動を踏襲。祝日連休などで stale 判定が誤爆しても壊れないように)。
    戻り値: (rows, source_name, notes)
    """
    notes: list[str] = []
    best: tuple[list[Row], str] | None = None
    for f in fetchers:
        rows = f.fetch(sym, market)
        problems = validate_series(rows, today=today)
        if not problems:
            return rows, f.name, notes
        notes.append(f"{f.name}: {', '.join(problems)}")
        if rows and (best is None or rows[-1][0] > best[0][-1][0]):
            best = (rows, f.name)
    if best:
        return best[0], best[1], notes
    return None, None, notes
