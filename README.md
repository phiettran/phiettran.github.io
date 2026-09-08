# Portfolio

A deliberately loud, brutalist one-page portfolio. Off-white paper, oversized
Helvetica, hard black borders, blurless shadows, and project cards that expand
into a full detail view with screenshots.

Built with Next.js 16, React 19 and Tailwind v4. It compiles to a plain static
site, so it hosts free anywhere.

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

### Your links

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

## Running it

```bash
npm run dev
```

Then open http://localhost:3000.

To produce the static site in `out/`:

```bash
npm run build
```

---

## Putting it on the web, free

You need the code in a GitHub repo first:

```bash
git init && git add -A && git commit -m "Initial commit"
```

Then create a repo on GitHub and push to it.

### Option A — Vercel or Netlify (easiest)

Import the repo at [vercel.com/new](https://vercel.com/new) or
[app.netlify.com](https://app.netlify.com). Both auto-detect Next.js, need zero
configuration, give you a free HTTPS subdomain, and redeploy on every push.

### Option B — GitHub Pages

A workflow is already included at `.github/workflows/deploy.yml`. Enable it
under **Settings → Pages → Source → "GitHub Actions"**, then push.

One catch: if your site lives at `username.github.io/portfolio` rather than at
a custom domain, tell Next about the subpath, or every asset 404s. Add to
`next.config.ts`:

```ts
basePath: "/portfolio",
```

Not needed for `username.github.io` itself, or for a custom domain.

---

## Notes

- `output: "export"` in `next.config.ts` is what makes this a static site. If
  you ever add a server feature (API routes, server actions, image
  optimization), remove that line and deploy to Vercel instead.
- Colors and type live as tokens at the top of `src/app/globals.css`:
  `--color-paper`, `--color-ink`, `--color-blood`. Change `--color-blood` to
  re-key the whole accent in one edit.
- The page commits to a single light look on purpose — the brutalist poster
  aesthetic depends on the paper ground, so there is no dark mode.
- Respects `prefers-reduced-motion`: the ticker and hover transitions stop for
  anyone who has asked their OS to reduce motion.
