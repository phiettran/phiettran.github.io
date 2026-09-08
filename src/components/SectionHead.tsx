export default function SectionHead({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="text-[clamp(1.9rem,5vw,2.75rem)]">{title}</h2>
      {note && <span className="chrome text-sm text-muted">{note}</span>}
    </div>
  );
}
