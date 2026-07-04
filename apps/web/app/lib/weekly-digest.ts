import weeklyDigestJson from "../../../../data/weekly_digest.json";

export interface WeeklyDigest {
  updated: string;
  week_start: string;
  week_end: string;
  title: string;
  body: string;
}

export const weeklyDigest = weeklyDigestJson as WeeklyDigest;

export function digestWeekLabel(): string {
  const [, sm, sd] = weeklyDigest.week_start.split("-");
  const [, em, ed] = weeklyDigest.week_end.split("-");
  if (!sm || !em) {
    return weeklyDigest.week_start;
  }
  if (sm === em) {
    return `${Number(sm)}/${Number(sd)}〜${Number(ed)}`;
  }
  return `${Number(sm)}/${Number(sd)}〜${Number(em)}/${Number(ed)}`;
}
