import { profile } from "@/content/site";

const links = [
  { label: "work", href: "#work" },
  { label: "about", href: "#about" },
  { label: "say hi", href: "#contact" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
        <a
          href="#top"
          className="font-script text-2xl text-ink transition-colors hover:text-navy"
        >
          {profile.name}
        </a>

        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="chrome rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:bg-mist/60 hover:text-ink sm:px-4"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
