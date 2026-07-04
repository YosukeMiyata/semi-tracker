# -*- coding: utf-8 -*-
"""米日連動分析 — v1 (yuyu5555-bit/semi-tracker) の linkage.py を移植。

手法(サイト上にも明記する・仕様書 4.3):
  米国テーマ(構成銘柄の単純平均リターン)が前日 +2% 以上だった日について、
  翌営業日の連動日本株リターンを過去データで集計した「陽性率」と「平均リターン」。
  単純な条件付き集計であり、交絡調整(市場全体・為替要因の除去)は行っていない。

v2 での修正点:
- v1 で定義のみ未使用だった MIN_SAMPLE を適用(サンプル n < 5 の行は除外)

linkage[テーマ名] = {
  "us": [[sym, name, latestChg], ...],   # 構成米国株と直近前日比(%)
  "usAvg": 直近の米国テーマ平均リターン(%),
  "triggered": bool,                     # 直近が THRESHOLD% 以上か
  "trigLevel": 0-3,                      # 2%/5%/10% の段階
  "rows": [ {code, name, rate, avg, n}, ... ]  # 連動日本株(連動率降順)
}
"""

from __future__ import annotations

THRESHOLD = 2.0
MIN_SAMPLE = 5

METHOD_NOTE = (
    "米国テーマ(構成銘柄平均)が前日+2%超の日の翌営業日リターンを集計した"
    f"陽性率と平均(単純集計・交絡調整なし、サンプル数 n≥{MIN_SAMPLE})"
)


def _daily_returns(daily):
    rets = {}
    for i in range(1, len(daily)):
        c0 = daily[i - 1][1]
        d1, c1 = daily[i][0], daily[i][1]
        if c0:
            rets[d1] = (c1 / c0 - 1) * 100
    return rets


def _latest_chg(daily):
    if not daily or len(daily) < 2:
        return None
    c0, c1 = daily[-2][1], daily[-1][1]
    return (c1 / c0 - 1) * 100 if c0 else None


def _theme_daily_avg_return(us_syms, quotes):
    series = []
    for s in us_syms:
        q = quotes.get(s)
        if q and q.get("daily"):
            series.append(_daily_returns(q["daily"]))
    if not series:
        return {}
    dates = set()
    for r in series:
        dates |= set(r.keys())
    out = {}
    for d in dates:
        vals = [r[d] for r in series if d in r]
        if vals:
            out[d] = sum(vals) / len(vals)
    return out


def _next_day_map(daily):
    ds = [row[0] for row in daily]
    return {ds[i]: ds[i + 1] for i in range(len(ds) - 1)}


def build_linkage(macro, quotes):
    linkage = {}
    for m in macro:
        for sub in m["subs"]:
            us_list = sub["us"]
            us_syms = [s for s, _ in us_list]
            if not us_syms:
                continue
            tret = _theme_daily_avg_return(us_syms, quotes)
            if not tret:
                continue
            trig = {d for d, v in tret.items() if v >= THRESHOLD}
            latest_date = max(tret.keys()) if tret else None
            us_avg = round(tret[latest_date], 2) if latest_date else None
            us_info = []
            for s, nm in us_list:
                q = quotes.get(s)
                ch = _latest_chg(q["daily"]) if (q and q.get("daily")) else None
                us_info.append([s, nm, round(ch, 2) if ch is not None else None])
            jp_rows = [(c, n) for c, n, *_ in sub["jp"]] + [(c, n) for c, n, *_ in sub["solo"]]
            results = []
            for code, name in jp_rows:
                q = quotes.get(code)
                if not q or not q.get("daily"):
                    continue
                jp_ret = _daily_returns(q["daily"])
                nxt = _next_day_map(q["daily"])
                ups, acc = 0, []
                for td in trig:
                    nd = nxt.get(td)
                    if nd and nd in jp_ret:
                        r = jp_ret[nd]
                        acc.append(r)
                        if r > 0:
                            ups += 1
                if len(acc) < MIN_SAMPLE:
                    continue  # v2: サンプル不足の行は載せない(v1 では未適用だった)
                results.append(
                    {
                        "code": code,
                        "name": name,
                        "rate": round(ups / len(acc) * 100, 0),
                        "avg": round(sum(acc) / len(acc), 2),
                        "n": len(acc),
                    }
                )
            results.sort(key=lambda x: (x["rate"], x["avg"]), reverse=True)
            if results:
                trig_level = 0
                if us_avg is not None:
                    if us_avg >= 10:
                        trig_level = 3  # 急騰(10%↑)
                    elif us_avg >= 5:
                        trig_level = 2  # 大幅高(5%↑)
                    elif us_avg >= 2:
                        trig_level = 1  # 上昇(2%↑)
                linkage[f"{m['name']} > {sub['name']}"] = {
                    "us": us_info,
                    "usAvg": us_avg,
                    "triggered": bool(trig_level >= 1),
                    "trigLevel": trig_level,
                    "rows": results,
                }
    return linkage
