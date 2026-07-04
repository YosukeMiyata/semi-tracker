import type { ReactNode } from "react";
import { InfoDialog } from "~/components/info-dialog";

export function SectionTitle({
  title,
  note,
  info,
}: {
  title: string;
  note?: string;
  info?: { label: string; title: string; content: ReactNode };
}) {
  return (
    <>
      <h2 className="mt-[26px] mb-1 flex items-center gap-2 font-bold font-serif text-[17px]">
        {title}
        {info ? (
          <InfoDialog label={info.label} title={info.title}>
            {info.content}
          </InfoDialog>
        ) : null}
        <span className="h-px flex-1 bg-line" />
      </h2>
      {note ? <div className="mb-3 text-[12px] text-ink-2">{note}</div> : null}
    </>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 rounded-card border border-line bg-card p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed text-[12.5px] text-ink-2">
      <span className="mr-2 rounded-md bg-copper-soft px-2 py-0.5 font-bold text-[10.5px] text-copper">
        実装予定
      </span>
      {children}
    </Card>
  );
}
