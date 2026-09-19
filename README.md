# Portfolio

Built with Next.js 16, React 19 and Tailwind v4. Compiled to plain static
site (hosts free anywhere)

---

## Where everything lives

**All the words on the site come from one file: `src/content/site.ts`.**
Images go in `public/`. That is the whole system.

| What you want to change | Where |
| --- | --- |
| Name (also drives the animated signature) | `profile.name` |
| Job title, location, email | `profile.role`, `.location`, `.email` |
| The paragraph under your name | `profile.blurb` |
| The little pill on your photo | `profile.stamp` (empty string hides it) |
| GitHub / LinkedIn / resume buttons | `profile.socials` |
| Your projects | `projects` |
| The label/value table | `facts` |
| The numbered one-liners | `trivia` |
| Your photo | `public/headshot.jpg` |
| Project screenshots | `public/projects/` |
| Your resume PDF | `public/resume.pdf` |

### links

In `profile.socials`. Add or remove rows freely — the buttons follow.

```ts
socials: [
  { label: "github",   href: "https://github.com/your-real-handle" },
  { label: "linkedin", href: "https://linkedin.com/in/your-real-handle" },
  { label: "resume",   href: "/resume.pdf" },
],
```

`/resume.pdf` means the file `public/resume.pdf`. Drop the PDF there and the
button works; until then that button 404s.

### Your projects

Each project is one object in the `projects` array. Copy an existing one and
edit it — order in the array is the order on the page.

```ts
{
  slug: "ampedai",                    // internal id, lowercase, no spaces
  title: "ampedai",                   // shown on the card
  blurb: "one line, shown on the card.",
  year: "2026",
  role: "solo build",                 // or "team of 4", "research"
  tags: ["typescript", "next.js"],    // small pills
  cover: "/projects/ampedai.png",     // card preview, 4:3
  shots: [                            // gallery inside the expanded view
    "/projects/ampedai.png",
    "/projects/ampedai-2.png",
  ],
  description: [                      // each string is its own paragraph
    "what it is and what problem it solves.",
    "what you built, and what was genuinely hard.",
  ],
  links: [
    { label: "live demo", href: "https://..." },
    { label: "source",    href: "https://github.com/..." },
  ],
}
```

### Project previews

Put the image files in `public/projects/`, then reference them with a leading
slash: a file at `public/projects/ampedai.png` is written as
`/projects/ampedai.png`. Not `./public/...` — that path will 404.

- `cover` is cropped to 4:3, so keep the subject roughly centred.
- 800x600 or larger looks sharpest. Animated GIFs work as a `cover`.
- Filenames: lowercase, no spaces. `my-project.png`, never `My Project.PNG`.
  Your Mac ignores capitalisation; the deployed server does not.
- This is a static site, so images are shipped exactly as you save them —
  nothing resizes or compresses them at build time. Compress anything over
  about 500 KB first.

### Your photo

Replace `public/headshot.jpg`. If you use a different filename or shape,
update `src`, `width` and `height` in `src/components/Hero.tsx` (around line
44) so the frame keeps the right proportions.

### Colours and fonts

Colour tokens are at the top of `src/app/globals.css` under `@theme` —
`--color-navy` re-keys the accent across the whole site in one edit. The three
fonts are set in `src/app/layout.tsx`: Space Grotesk (headings), DM Sans
(body), Kalam (the handwritten signature).
