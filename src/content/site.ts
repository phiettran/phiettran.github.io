/* ============================================================
   EDIT THIS FILE. Everything on the site comes from here.
   Lowercase is the house style — write it the way you want it
   to appear, and it will show up exactly like that.
   ============================================================ */

export const profile = {
  /* Also used for the animated cursive signature in the hero. */
  name: "phiet tran",
  role: "software engineer",
  location: "los angeles, ca",
  email: "tranphiet@ucla.edu",
  /* Short, warm, first-person. Two or three sentences. */
  blurb:
    "i build things that probably did not need to exist, and then i make them fast. currently studying at UCLA and turning caffeine into commits.",
  /* Small pill tucked under your photo. Empty string hides it. */
  stamp: "open to work",
  socials: [
    { label: "github", href: "https://github.com/yourusername" },
    { label: "linkedin", href: "https://linkedin.com/in/phiet-tran" },
    { label: "resume", href: "/resume.pdf" },
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
      "We engineered a front-end dashboard delivering all the sensors metrics into a consolidated score and AI sleep recommendations to users",
    ],
  },
  {
    slug: "project-two",
    title: "project two",
    blurb: "built at a hackathon on zero sleep and it somehow shipped.",
    year: "2025",
    role: "team of 4",
    tags: ["python", "fastapi", "websockets"],
    cover: "/projects/placeholder-02.svg",
    shots: ["/projects/placeholder-02.svg", "/projects/placeholder-03.svg"],
    description: [
      "replace this with what the project actually is. mention the constraint that shaped it — a 36 hour deadline, a tiny device, a hostile api.",
      "say what you specifically owned if it was a team build. recruiters read this part closely.",
    ],
  },
  {
    slug: "project-three",
    title: "project three",
    blurb: "machine learning, but pointed at something unserious.",
    year: "2025",
    role: "research",
    tags: ["pytorch", "pandas", "numpy"],
    cover: "/projects/placeholder-03.svg",
    shots: ["/projects/placeholder-03.svg", "/projects/placeholder-01.svg"],
    description: [
      "replace this with what the project actually is. if it was research, name the question you were trying to answer.",
      "close with the result, even if the result was that it did not work. honest negative results read better than vague positive ones.",
    ],
  },
  {
    slug: "project-four",
    title: "project four",
    blurb: "the one i keep meaning to finish.",
    year: "2024",
    role: "solo build",
    tags: ["rust", "cli"],
    cover: "/projects/placeholder-01.svg",
    shots: ["/projects/placeholder-01.svg"],
    description: [
      "replace this with what the project actually is. unfinished projects are fine to show if you are honest about where they stopped.",
    ],
  },
];

/* The label/value table. The part people actually remember. */
export const facts = [
  { label: "currently", value: "building ampedai" },
  { label: "looping", value: "one album, for three months straight" },
  { label: "collecting", value: "mechanical keyboards i do not need" },
  { label: "avoiding", value: "merge conflicts, my inbox" },
  { label: "snack", value: "whatever is closest" },
  { label: "hot take", value: "tabs. obviously." },
];

/* Rapid-fire list. Short and a little unhinged. */
export const trivia = [
  "i have rewritten this portfolio four times.",
  "i once debugged for six hours over a missing comma.",
  "i name my branches after snacks.",
  "my git history is a cry for help.",
  "i will talk about typography unprompted.",
];
