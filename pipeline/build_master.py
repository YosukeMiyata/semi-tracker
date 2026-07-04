#!/usr/bin/env python3
"""銘柄マスタ(themes.py)を data/themes.json に変換する。

v1 (https://github.com/yuyu5555-bit/semi-tracker) の「themes.py だけ編集すれば
銘柄・テーマを足せる」運用を v2 でも維持するための変換層。

実行: python3 pipeline/build_master.py  (または pnpm data:master)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from themes import MACRO  # noqa: E402

OUT_PATH = Path(__file__).resolve().parents[1] / "data" / "themes.json"


def _jp_row(row: list) -> dict:
    return {
        "code": row[0],
        "name": row[1],
        "note": row[2] if len(row) > 2 else "",
    }


def build() -> tuple[dict, list[str]]:
    warnings: list[str] = []
    jp_names: dict[str, str] = {}
    us_names: dict[str, str] = {}
    macro_out = []

    for m in MACRO:
        subs_out = []
        for sub in m["subs"]:
            us_out = []
            for sym, name in sub["us"]:
                if sym in us_names and us_names[sym] != name:
                    warnings.append(f"米国銘柄 {sym} の表記ゆれ: {us_names[sym]} / {name}")
                us_names.setdefault(sym, name)
                us_out.append({"symbol": sym, "name": name})

            jp_out: list[dict] = []
            solo_out: list[dict] = []
            for rows, out in ((sub["jp"], jp_out), (sub["solo"], solo_out)):
                seen_in_sub: set[tuple[str, str]] = set()
                for row in rows:
                    item = _jp_row(row)
                    key = (item["code"], item["name"])
                    if key in seen_in_sub:
                        warnings.append(
                            f"重複行を除外: {m['name']} > {sub['name']} の"
                            f" {item['code']} {item['name']}"
                        )
                        continue
                    seen_in_sub.add(key)
                    if item["code"] in jp_names and jp_names[item["code"]] != item["name"]:
                        warnings.append(
                            f"日本銘柄 {item['code']} の表記ゆれ:"
                            f" {jp_names[item['code']]} / {item['name']}"
                        )
                    jp_names.setdefault(item["code"], item["name"])
                    out.append(item)

            subs_out.append({"name": sub["name"], "us": us_out, "jp": jp_out, "solo": solo_out})

        macro_out.append(
            {"key": m["key"], "name": m["name"], "color": m["color"], "subs": subs_out}
        )

    data = {
        "source": "pipeline/themes.py (v1: yuyu5555-bit/semi-tracker の銘柄マスタを踏襲)",
        "stats": {
            "macro_themes": len(macro_out),
            "sub_themes": sum(len(m["subs"]) for m in macro_out),
            "jp_stocks": len(jp_names),
            "us_symbols": len(us_names),
        },
        "macro": macro_out,
    }
    return data, warnings


def main() -> None:
    data, warnings = build()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    stats = data["stats"]
    print(f"wrote {OUT_PATH}")
    print(
        f"  マクロテーマ {stats['macro_themes']} / サブテーマ {stats['sub_themes']}"
        f" / 日本株 {stats['jp_stocks']} / 米国 {stats['us_symbols']}"
    )
    for warning in warnings:
        print(f"  warning: {warning}", file=sys.stderr)

    from build_maps import main as build_maps_main  # noqa: E402

    build_maps_main()

    from tags import TAGS  # noqa: E402

    tags_path = OUT_PATH.parent / "stock_tags.json"
    tags_path.write_text(
        json.dumps({"source": "pipeline/tags.py (v1)", "tags": TAGS}, ensure_ascii=False, indent=1)
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {tags_path.name} ({len(TAGS)} symbols)")


if __name__ == "__main__":
    main()
