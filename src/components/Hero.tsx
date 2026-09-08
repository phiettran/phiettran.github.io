import Image from "next/image";
import { profile } from "@/content/site";
import Signature from "./Signature";

export default function Hero() {
  return (
    <section id="top" className="px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-rise">
          <p className="chrome text-sm text-muted">hi, i am</p>

          <h1 className="mt-1 max-w-[26rem]">
            <Signature text={profile.name} />
          </h1>

          <p className="chrome mt-4 text-lg text-muted">
            {profile.role} · {profile.location}
          </p>

          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink/80">
            {profile.blurb}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="chrome inline-block rounded-full border border-line bg-shell px-5 py-2.5 text-sm text-ink/85 shadow-soft transition-all hover:-translate-y-0.5 hover:border-navy/35 hover:text-navy hover:shadow-lift"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Photo, tilted like something pinned to a corkboard. */}
        <div className="animate-rise relative mx-auto w-full max-w-xs md:max-w-none">
          <div className="rotate-[-2.5deg] rounded-[var(--radius-soft)] bg-shell p-3 shadow-lift transition-transform duration-500 hover:rotate-0">
            <Image
              src="/headshot.jpg"
              alt={profile.name}
              width={1187}
              height={1200}
              priority
              className="block h-auto w-full rounded-[calc(var(--radius-soft)-0.4rem)]"
            />
          </div>

          {profile.stamp && (
            <span className="chrome absolute -bottom-3 -right-2 rotate-3 rounded-full bg-navy/95 px-4 py-1.5 text-xs text-shell shadow-soft">
              {profile.stamp}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
