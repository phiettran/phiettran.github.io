import { profile } from "@/content/site";

export default function Footer() {
  return (
    <footer id="contact" className="px-5 pb-16 pt-8 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[var(--radius-soft)] border border-line bg-shell px-6 py-12 text-center shadow-soft sm:px-10 sm:py-16">
          <h2 className="text-[clamp(1.9rem,5vw,2.75rem)]">say hi</h2>

          <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink/70">
            i prefer email for the fastest response.
          </p>

          <a
            href={`mailto:${profile.email}`}
            className="chrome mt-7 inline-block break-all rounded-full bg-navy px-7 py-3.5 text-shell shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            {profile.email}
          </a>

          <ul className="mt-8 flex flex-wrap justify-center gap-5">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="chrome text-sm text-muted underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-navy"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="chrome mt-8 text-center text-sm text-muted">
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
