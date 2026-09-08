import { tickerItems } from "@/content/site";

export default function Ticker() {
  // Nothing to say, nothing to show.
  if (tickerItems.length === 0) return null;

  const run = [...tickerItems, ...tickerItems];

  return (
    <div className="overflow-hidden border-y border-line/70 bg-mist/40 py-3">
      <div className="flex w-max animate-drift">
        {run.map((item, i) => (
          <span
            key={i}
            className="chrome flex items-center whitespace-nowrap px-5 text-sm text-muted"
          >
            {item}
            <span className="ml-5 text-navy/50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
