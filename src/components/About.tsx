import { facts, trivia } from "@/content/site";
import SectionHead from "./SectionHead";

export default function About() {
  return (
    <section id="about" className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHead title="about me" />

        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <dl className="overflow-hidden rounded-[var(--radius-soft)] border border-line bg-shell shadow-soft">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`flex flex-col gap-0.5 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-6 ${
                  i !== facts.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <dt className="chrome shrink-0 text-sm text-muted sm:w-28">
                  {fact.label}
                </dt>
                <dd className="text-[1.05rem] text-ink/85">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="chrome text-sm text-muted">things that are true</p>
            <ul className="mt-4 space-y-3">
              {trivia.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3.5 rounded-[var(--radius-soft)] border border-line bg-shell px-5 py-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="font-script text-xl leading-none text-navy/70">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
