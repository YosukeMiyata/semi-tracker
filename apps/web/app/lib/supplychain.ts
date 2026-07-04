import { recentNews } from "~/lib/news";
import supplychainJson from "../../../../data/supplychain.json";
import themesJson from "../../../../data/themes.json";

export interface SupplyStep {
  name: string;
  equip?: string[];
  material?: string[];
  stocks?: string[];
}

export interface SupplyStage {
  id: string;
  num: string;
  name: string;
  desc: string;
  topic: string;
  steps: SupplyStep[];
}

export const stages = supplychainJson.stages as SupplyStage[];

/** 銘柄コード→表示名(themes.py マスタ由来。米国ティッカー含む) */
export const codeNames = new Map<string, string>();
for (const m of themesJson.macro) {
  for (const sub of m.subs) {
    for (const u of sub.us) {
      codeNames.set(u.symbol, u.name);
    }
    for (const row of [...sub.jp, ...sub.solo]) {
      codeNames.set(row.code, row.name);
    }
  }
}

export function stockName(code: string): string {
  return codeNames.get(code) ?? code;
}

function stageCodes(stage: SupplyStage): Set<string> {
  const codes = new Set<string>();
  for (const step of stage.steps) {
    for (const code of [...(step.equip ?? []), ...(step.material ?? []), ...(step.stocks ?? [])]) {
      codes.add(code);
    }
  }
  return codes;
}

/** 今週のニュース件数 = 直近7日のニュースのうち関連銘柄がステージ構成銘柄と重なる件数 */
export function stageNewsCount(stage: SupplyStage): number {
  const codes = stageCodes(stage);
  return recentNews(7).filter((n) => n.related_stocks.some((s) => codes.has(s.code))).length;
}
