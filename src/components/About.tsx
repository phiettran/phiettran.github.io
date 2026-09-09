import Image from "next/image";
import { facts, trivia, photos, spotify } from "@/content/site";
import SectionHead from "./SectionHead";
import NowPlaying from "./NowPlaying";

/* Deterministic pseudo-random in [0,1). Math.random() would give the server
   and the browser different layouts and blow up hydration, so the scatter is
   seeded off each item's index instead. */
function seeded(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Item =
  | { kind: "fact"; label: string; value: string }
  | { kind: "note"; index: number; text: string }
  | { kind: "photo"; src: string; alt: string; caption?: string }
  | { kind: "spotify" };

/* Weave the photos through the text so the pile does not end up as a block
   of writing with a block of pictures stuck on the end. */
function buildPile(): Item[] {
  const text: Item[] = [
    ...facts.map((f) => ({ kind: "fact" as const, label: f.label, value: f.value })),
    ...trivia.map((t, i) => ({ kind: "note" as const, index: i + 1, text: t })),
  ];
  const pics: Item[] = photos.map((p) => ({ kind: "photo" as const, ...p }));

  const out: Item[] = [];
  const every = Math.max(2, Math.ceil(text.length / (pics.length + 1)));
  let p = 0;
  text.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % every === 0 && p < pics.length) out.push(pics[p++]);
  });
  while (p < pics.length) out.push(pics[p++]);

  /* Leads the pile rather than sitting in its own column — a column left a
     tall gap beneath it once the card ran out. Here it is just the first
     card, wider and upright, so it still carries the most weight. */
  if (spotify.endpoint) out.unshift({ kind: "spotify" });

  return out;
}

const WIDTHS = ["15rem", "17.5rem", "13.5rem", "19rem"];

export default function About() {
  const pile = buildPile();

  return (
    <section id="about" className="overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHead title="about me" />

        <div className="pile mt-10">
          {pile.map((item, i) => {
            /* The music card sits square and wider than the rest: upright
               among tilted cards is what makes it read as the anchor. */
            const isSpotify = item.kind === "spotify";
            const rot = isSpotify ? 0 : (seeded(i, 1) * 2 - 1) * 6.5;
            const mt = isSpotify ? 0 : -seeded(i, 2) * 26;
            const ml = isSpotify ? 0 : -seeded(i, 3) * 30;
            const z = isSpotify ? 30 : Math.floor(seeded(i, 4) * 20) + 1;
            const width = isSpotify
              ? "25rem"
              : WIDTHS[Math.floor(seeded(i, 5) * WIDTHS.length)];

            const style = {
              "--rot": `${rot.toFixed(2)}deg`,
              "--z": z,
              "--mt": `${mt.toFixed(1)}px`,
              "--ml": `${ml.toFixed(1)}px`,
              width,
            } as React.CSSProperties;

            if (item.kind === "spotify") {
              return (
                <NowPlaying
                  key={`s-${i}`}
                  className="pile-item pile-item--tech"
                  style={style}
                />
              );
            }

            if (item.kind === "photo") {
              return (
                <figure key={`p-${i}`} className="pile-item" style={style} tabIndex={0}>
                  <div className="rounded-[var(--radius-soft)] border border-line bg-shell p-2.5 pb-3 shadow-soft">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={640}
                      height={640}
                      className="block h-auto w-full rounded-[calc(var(--radius-soft)-0.5rem)]"
                    />
                    {item.caption && (
                      <figcaption className="font-script mt-2 text-center text-base text-muted">
                        {item.caption}
                      </figcaption>
                    )}
                  </div>
                </figure>
              );
            }

            if (item.kind === "fact") {
              return (
                <div key={`f-${i}`} className="pile-item" style={style} tabIndex={0}>
                  <div className="rounded-[var(--radius-soft)] border border-line bg-shell px-5 py-4 shadow-soft">
                    <p className="chrome text-xs text-muted">{item.label}</p>
                    <p className="mt-1 text-[1.05rem] leading-snug text-ink/85">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={`n-${i}`} className="pile-item" style={style} tabIndex={0}>
                <div className="flex gap-3 rounded-[var(--radius-soft)] border border-line bg-shell px-5 py-4 shadow-soft">
                  <span className="font-script text-xl leading-none text-navy/70">
                    {item.index}
                  </span>
                  <span className="leading-relaxed text-ink/80">{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
