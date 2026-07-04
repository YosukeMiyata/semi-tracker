#!/usr/bin/env python3
"""工程マップ・フロー図 JSON を themes.py 銘柄マスタから生成する。

生成物:
  data/process.json  v1 工程タブ(装置|材料 2カラム)
  data/flow.json     v1 フロー図(5ステージ)

実行: python3 pipeline/build_maps.py  (または pnpm data:maps)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from flow_map import resolve_flow  # noqa: E402
from process_map import ALIAS, PROCESS_MAP  # noqa: E402
from themes import all_symbols  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def resolve_codes(codes: list[str], symbols: dict[str, tuple[str, str]]) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for raw in codes:
        code = ALIAS.get(raw, raw)
        if code in symbols and code not in seen:
            name, market = symbols[code]
            out.append({"code": code, "name": name, "market": market})
            seen.add(code)
    return out


def build_process(symbols: dict[str, tuple[str, str]]) -> list[dict]:
    proc: list[dict] = []
    for step in PROCESS_MAP:
        item: dict = {
            "stage": step["stage"],
            "name": step["name"],
            "desc": step.get("desc", ""),
            "icon": step.get("icon", ""),
        }
        if "groups" in step:
            item["groups"] = [
                {"label": g["label"], "stocks": resolve_codes(g["stocks"], symbols)}
                for g in step["groups"]
            ]
        else:
            item["equip"] = resolve_codes(step.get("equip", []), symbols)
            item["material"] = resolve_codes(step.get("material", []), symbols)
        proc.append(item)
    return proc


def build() -> tuple[dict, dict]:
    symbols = all_symbols()
    process_payload = {
        "source": "pipeline/process_map.py (v1: yuyu5555-bit/semi-tracker)",
        "steps": build_process(symbols),
    }
    flow_payload = {
        "source": "pipeline/flow_map.py (v1: yuyu5555-bit/semi-tracker)",
        "stages": resolve_flow(symbols),
    }
    return process_payload, flow_payload


def main() -> None:
    process_payload, flow_payload = build()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    process_path = DATA_DIR / "process.json"
    flow_path = DATA_DIR / "flow.json"
    process_path.write_text(
        json.dumps(process_payload, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    flow_path.write_text(
        json.dumps(flow_payload, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )

    n_proc = len(process_payload["steps"])
    n_flow = len(flow_payload["stages"])
    n_stocks = sum(
        len(s.get("equip", []))
        + len(s.get("material", []))
        + sum(len(g.get("stocks", [])) for g in s.get("groups", []))
        for s in process_payload["steps"]
    )
    print(f"wrote {process_path.name} ({n_proc} 工程 / {n_stocks} 銘柄参照)")
    print(f"wrote {flow_path.name} ({n_flow} ステージ)")


if __name__ == "__main__":
    main()
