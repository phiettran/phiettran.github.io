import Image from "next/image";
import { facts, trivia, photos } from "@/content/site";
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
  | { kind: "photo"; src: string; alt: string; caption?: string };

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
  return out;
}

const WIDTHS = ["15rem", "17.5rem", "13.5rem", "19rem"];

export default function About() {
  const pile = buildPile();

  return (
    <section id="about" className="overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead title="about me" />

        {/* Flex, not grid: when there is nothing playing NowPlaying renders
            nothing at all, and the pile should reclaim the full width rather
            than sit beside an empty column. */}
        <div className="mt-10 flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <NowPlaying className="w-full lg:sticky lg:top-24 lg:w-[19rem] lg:shrink-0" />

          <div className="pile min-w-0 flex-1">
          {pile.map((item, i) => {
            const rot = (seeded(i, 1) * 2 - 1) * 6.5;
            const mt = -seeded(i, 2) * 26;
            const ml = -seeded(i, 3) * 30;
            const z = Math.floor(seeded(i, 4) * 20) + 1;
            const width = WIDTHS[Math.floor(seeded(i, 5) * WIDTHS.length)];

            const style = {
              "--rot": `${rot.toFixed(2)}deg`,
              "--z": z,
              "--mt": `${mt.toFixed(1)}px`,
              "--ml": `${ml.toFixed(1)}px`,
              width,
            } as React.CSSProperties;

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
      </div>
    </section>
  );
}
