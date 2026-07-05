import { Link } from "react-router";
import { EventCalendarGrid } from "~/components/event-calendar-grid";
import { Card, SectionTitle } from "~/components/section";
import { upcomingEvents } from "~/lib/events";

export function EventCalendarPreview() {
  const events = upcomingEvents(14);
  if (events.length === 0) {
    return null;
  }

  return (
    <>
      <SectionTitle
        title="今後2週間のイベント"
        note="決算・規制・業界 — 月曜始まり2週間 · data/events.json"
      />
      <Card>
        <EventCalendarGrid compact showDetail={false} />
        <Link
          to="/news"
          className="type-body-sm mt-3 block border-line border-t border-dashed pt-3 text-center text-copper underline md:mt-4 md:pt-4"
        >
          詳細・イベント一覧 ↗
        </Link>
      </Card>
    </>
  );
}

export function EventCalendar() {
  const events = upcomingEvents(14);

  return (
    <>
      <SectionTitle
        title="イベントカレンダー"
        note="今後2週間 · テーマ紐付け · data/events.json を編集"
      />
      <Card>
        {events.length > 0 ? (
          <EventCalendarGrid />
        ) : (
          <p className="type-body-sm">予定されているイベントはありません。</p>
        )}
      </Card>
    </>
  );
}
