/* ============================================================
   EDIT THIS FILE. Everything on the site comes from here.
   Lowercase is the house style — write it the way you want it
   to appear, and it will show up exactly like that.
   ============================================================ */

export const profile = {
  /* Also used for the animated cursive signature in the hero. */
  name: "phiet tran",
  role: "software engineer  ",
  email: "tranphiet@ucla.edu",
  /* Short, warm, first-person. Two or three sentences. */
  blurb:
    " math + cs @ ucla",
  /* Small pill tucked under your photo. Empty string hides it. */
  socials: [
    { label: "github", href: "https://github.com/phiettran" },
    { label: "linkedin", href: "https://linkedin.com/in/phiet-tran" }
  ],
};

/* Optional scrolling strip under the hero. Leave empty to hide it. */
export const tickerItems: string[] = [];

export type Project = {
  slug: string;
  title: string;
  /* One line. Shown on the card. */
  blurb: string;
  year: string;
  role: string;
  tags: string[];
  /* Card preview image. Drop your screenshot in /public/projects/. */
  cover: string;
  /* Extra screenshots shown when the card is expanded. */
  shots: string[];
  /* Each string is its own paragraph in the expanded view. */
  description: string[];
  /* Optional. Omit the field entirely if a project has no links to show. */
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Dormi",
    blurb: "sleep environment monitor ",
    year: "2026",
    role: "Software and ML",
    tags: ["react", "Node.js", "TypeScript", "Vite", "SQLite", "OpenAI", "Tailwind", "Express"],
    cover: "/projects/placeholder-02.jpg",
    shots: ["/projects/placeholder-01.jpg", "/projects/placeholder-02.jpg"],
    description: [
      "sleep optimization device recording environmental metrics that actually track sleep quality (CO2 levels, humidity, temperature, light emission)",
      "Engineered a front-end dashboard delivering all the sensors metrics into a consolidated score and AI sleep recommendations to users",
    ],
  },
  {
    slug: "project-two",
    title: "StudySearcher",
    blurb: "fullstack app to find study-buddies",
    year: "2025",
    role: "team of 4",
    tags: ["React", "Node.js", "Express", "PostgreSQL", "Socket.io"],
    cover: "/projects/studysearcher.mp4",
    shots: ["/projects/studysearcher.mp4"],
    description: [
      "PERN study-partner platform w/ messaging, profile matching, moderation, etc.",
      "Designed front-end, matching algorithm, end-to-end messaging, and notification system",
    ],
  },
  {
    slug: "project-three",
    title: "youtube data analysis",
    blurb: "read our blog article :>",
    year: "2025",
    role: "research",
    tags: ["matplotlib", "pandas", "numpy"],
    cover: "/projects/project-3.jpg",
    shots: ["/projects/project-3-1.jpg", "/projects/project-3-2.jpg"],
    links: [{label: 'article', href: "https://ucladatares.medium.com/what-the-data-says-about-scrolling-sleep-and-mental-health-689e828be4fd"}],
    description: [
       "analysis on a chrome extension tracking user activity on youtube",
      "Engineered data cleaning pipeline using engagement and watch-time validity filters and led a statistical analysis on screen time, sleep quality, and stress"
    ]
  },
  {
    slug: "project-four",
    title: "blackhole candidate analysis",
    blurb: "computational astrophysics research",
    year: "2024",
    role: "research intern",
    tags: ["python", "numpy", "pytorch"],
    cover: "/projects/project-4.jpg",
    shots: ["/projects/project-4-2.jpg", "/projects/project-4.jpg"],
    links: [ {label: 'paper', href: "https://arxiv.org/abs/2412.06130"}] ,
    description: ["analyzed binary star systems (potential black holes)", 
      "made a filtering pipeline to preprocess + validate time-series data, and used mcmc methods to process radial velocity data",
    ],
  },
];

/* The label/value table. The part people actually remember. */
export const facts = [
  { label: "currently", value: "building ampedai" },
  { label: "favorite album", value: "Mk.gee - Two Star and the Dream Police" },
  { label: "", value: "i like working out" },
];

/* Rapid-fire list. Short and a little unhinged. */
export const trivia = [
  "learn head  and data consultant | datares @ ucla",
  "active member of theta tau professional engineering fraternity",
  "fashion and student trends (FAST) @ UCLA",
];

/* Photos scattered through the about pile. Drop images in /public/about/
   and list them here. Add or remove freely — the pile re-scatters itself.
   `caption` is optional; leave it off and no caption strip is drawn. */
export const photos: { src: string; alt: string; caption?: string }[] = [
  { src: "/about/photo-01.jpg", alt: "replace me", caption: "" },
  { src: "/about/photo-02.jpg", alt: "replace me" },
  { src: "/about/photo-03.jpg", alt: "replace me", caption: "" },
  { src: "/about/photo-04.jpg", alt: "replace me" },
];

/* Spotify "now playing" card in the about pile.

   `endpoint` is the public URL of the Cloudflare Worker in /worker —
   it holds the credentials, so this URL is safe to commit. Leave it as
   an empty string and the card simply doesn't render, which is what you
   want until the Worker is deployed. See worker/README.md. */
export const spotify = {
  /* `||` not `??`: an unset CI variable arrives as an empty string, and
     that must fall through to the literal below rather than override it. */
  endpoint:
    process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT ||
    "https://spotify-now-playing.phiettran.workers.dev",
  /* How often the browser re-checks, in seconds. */
  pollSeconds: 30,
};
