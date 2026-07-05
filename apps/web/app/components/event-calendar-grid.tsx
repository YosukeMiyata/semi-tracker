"use client";

import { useState } from "react";
import {
  type CalendarCell,
  type CalendarEvent,
  eventDateLabel,
  eventsGroupedByDate,
  eventThemeName,
  eventWeekdayLabel,
  isEventAnchorDay,
  KIND_CLASS,
  KIND_LABEL,
  twoWeekCalendarGrid,
  upcomingEvents,
  WEEKDAY_LABELS,
} from "~/lib/events";

function EventChip({
  event,
  onSelect,
}: {
  event: CalendarEvent;
  onSelect: (event: CalendarEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="type-meta mb-0.5 line-clamp-2 w-full rounded-md border border-line/80 bg-panel2 px-1 py-0.5 text-left leading-[1.35] hover:border-copper/50 focus-visible:outline-2 focus-visible:outline-copper md:px-1.5 md:py-1 md:leading-[1.4] lg:text-[13px]"
    >
      <span
        className={`type-badge mr-1 inline-block shrink-0 rounded-[2px] px-1 py-px font-mono leading-none md:text-[11px] ${KIND_CLASS[event.kind]}`}
      >
        {KIND_LABEL[event.kind].slice(0, 2)}
      </span>
      {event.title}
    </button>
  );
}

function DayCell({
  cell,
  compact,
  selected,
  onSelectDay,
  onSelectEvent,
}: {
  cell: CalendarCell;
  compact?: boolean;
  selected: boolean;
  onSelectDay: (cell: CalendarCell) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const hasEvents = cell.events.length > 0;
  const maxShow = compact ? 2 : 3;
  const hidden = cell.events.length - maxShow;

  return (
    <div
      className={`flex flex-col border-line border-r border-b p-1 last:border-r-0 md:p-1.5 ${
        compact ? "min-h-[3.75rem] md:min-h-[5rem]" : "min-h-[5.5rem] md:min-h-[7rem]"
      } ${cell.isPast ? "bg-paper/50 opacity-45" : "bg-card"} ${
        cell.isAnchor ? "ring-1 ring-copper/60 ring-inset" : ""
      } ${selected ? "bg-copper-soft/40" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelectDay(cell)}
        className={`type-mono-accent mb-0.5 w-full rounded px-0.5 text-left focus-visible:outline-2 focus-visible:outline-copper md:mb-1 md:text-[14px] ${
          cell.isAnchor ? "font-bold text-copper" : "text-ink-2"
        } ${hasEvents && !cell.isPast ? "hover:text-ink" : ""}`}
      >
        {cell.day}
      </button>
      <div className="min-h-0 flex-1 overflow-hidden">
        {!cell.isPast
          ? cell.events
              .slice(0, maxShow)
              .map((e) => (
                <EventChip key={`${e.date}-${e.title}`} event={e} onSelect={onSelectEvent} />
              ))
          : null}
        {!cell.isPast && hidden > 0 ? (
          <span className="type-meta font-mono">+{hidden}件</span>
        ) : null}
      </div>
    </div>
  );
}

function EventDetail({ event }: { event: CalendarEvent | null }) {
  if (!event) {
    return <p className="type-body-sm">日付またはイベントをタップすると詳細が表示されます。</p>;
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2 md:mb-2">
        <span className={`type-badge rounded-md px-2 py-0.5 font-mono ${KIND_CLASS[event.kind]}`}>
          {KIND_LABEL[event.kind]}
        </span>
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="type-meta rounded-full border border-line bg-panel2 px-2 py-0.5"
          >
            {eventThemeName(tag)}
          </span>
        ))}
      </div>
      <div className="type-card-title">{event.title}</div>
      <p className="type-body-sm mt-1.5 md:mt-2">{event.body}</p>
      {event.source_url ? (
        <a
          href={event.source_url}
          rel="noopener noreferrer"
          target="_blank"
          className="type-body-sm mt-2 inline-block text-copper underline md:mt-3"
        >
          出典 ↗
        </a>
      ) : null}
    </div>
  );
}

function KindLegend() {
  return (
    <div className="type-meta flex flex-wrap gap-2 md:gap-3">
      {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1">
          <i className={`inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5 ${KIND_CLASS[k]}`} />
          {KIND_LABEL[k]}
        </span>
      ))}
    </div>
  );
}

function EventListItem({
  event,
  compact,
  interactive,
  selected,
  onSelect,
}: {
  event: CalendarEvent;
  compact?: boolean;
  interactive: boolean;
  selected?: boolean;
  onSelect?: (event: CalendarEvent) => void;
}) {
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`type-badge rounded-md px-2 py-0.5 font-mono ${KIND_CLASS[event.kind]}`}>
          {KIND_LABEL[event.kind]}
        </span>
        <span className="type-list-primary font-medium leading-snug">{event.title}</span>
      </div>
      <p className={`type-body-sm mt-1.5 ${compact ? "line-clamp-1" : "line-clamp-2"}`}>
        {event.body}
      </p>
    </>
  );

  const className = `w-full rounded-[10px] border px-3 py-2.5 text-left md:px-4 md:py-3 ${
    selected ? "border-copper bg-copper-soft/30" : "border-line bg-panel2"
  } ${interactive ? "hover:border-copper/50 focus-visible:outline-2 focus-visible:outline-copper" : ""}`;

  if (!interactive) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={() => onSelect?.(event)} className={className}>
      {content}
    </button>
  );
}

function EventListView({
  compact = false,
  showDetail = true,
}: {
  compact?: boolean;
  showDetail?: boolean;
}) {
  const events = upcomingEvents(14);
  const groups = eventsGroupedByDate(events);
  const { rangeLabel } = twoWeekCalendarGrid();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    showDetail ? (events[0] ?? null) : null,
  );

  return (
    <>
      <div className="type-meta mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
        <span>{rangeLabel}</span>
        <KindLegend />
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {groups.map(({ date, events: dayEvents }) => (
          <div key={date}>
            <div
              className={`type-mono-accent md:text-[14px] ${
                isEventAnchorDay(date) ? "font-bold text-copper" : "text-ink-2"
              }`}
            >
              {eventDateLabel(date)}({eventWeekdayLabel(date)})
              {isEventAnchorDay(date) ? " · 基準日" : ""}
            </div>
            <ul className="mt-1.5 flex flex-col gap-1.5 md:mt-2 md:gap-2">
              {dayEvents.map((event) => (
                <li key={`${event.date}-${event.title}`}>
                  <EventListItem
                    event={event}
                    compact={compact}
                    interactive={showDetail}
                    selected={showDetail && selectedEvent === event}
                    onSelect={setSelectedEvent}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {showDetail ? (
        <div className="mt-3 rounded-[10px] border border-line border-dashed bg-panel2 px-3 py-2.5 md:mt-4 md:px-4 md:py-3">
          <EventDetail event={selectedEvent} />
        </div>
      ) : null}
    </>
  );
}

export function EventCalendarGrid({
  compact = false,
  showDetail = true,
}: {
  compact?: boolean;
  showDetail?: boolean;
}) {
  const { weeks, rangeLabel } = twoWeekCalendarGrid();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const pickDay = (cell: CalendarCell) => {
    if (cell.isPast && cell.events.length === 0) {
      return;
    }
    setSelectedDate(cell.date);
    setSelectedEvent(cell.events[0] ?? null);
  };

  const pickEvent = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setSelectedEvent(event);
  };

  return (
    <div>
      <div className="md:hidden">
        <EventListView compact={compact} showDetail={showDetail} />
      </div>

      <div className="hidden md:block">
        <div className="type-meta mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
          <span>{rangeLabel}</span>
          <KindLegend />
        </div>

        <div className="overflow-hidden rounded-[10px] border border-line">
          <div className="grid grid-cols-7 border-line border-b bg-panel2">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="type-meta border-line border-r py-2 text-center font-mono last:border-r-0 md:py-2.5"
              >
                {label}
              </div>
            ))}
          </div>
          {weeks.map((row, wi) => (
            <div key={row[0]?.date ?? `week-${wi}`} className="grid grid-cols-7">
              {row.map((cell) => (
                <DayCell
                  key={cell.date}
                  cell={cell}
                  compact={compact}
                  selected={selectedDate === cell.date}
                  onSelectDay={pickDay}
                  onSelectEvent={pickEvent}
                />
              ))}
            </div>
          ))}
        </div>

        {showDetail ? (
          <div className="mt-3 rounded-[10px] border border-line border-dashed bg-panel2 px-3 py-2.5 md:mt-4 md:px-4 md:py-3">
            <EventDetail event={selectedEvent} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
