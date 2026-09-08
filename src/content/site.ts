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
    cover: "/projects/placeholder-02.svg",
    shots: ["/projects/placeholder-02.svg", "/projects/placeholder-03.svg"],
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
    cover: "/projects/placeholder-03.svg",
    shots: ["/projects/placeholder-03.svg", "/projects/placeholder-01.svg"],
    description: [
       "analysis on a chrome extension tracking user activity on youtube",
      "Engineered data cleaning pipeline using engagement and watch-time validity filters and led a statistical analysis on screen time, sleep quality, and stress",
    ]
  },
  {
    slug: "project-four",
    title: "blackhole candidate analysis",
    blurb: "computational astrophysics research",
    year: "2024",
    role: "research intern",
    tags: ["python", "numpy", "pytorch"],
    cover: "/projects/placeholder-01.svg",
    shots: ["/projects/placeholder-01.svg"],
    description: ["analyzed binary star systems (potential black holes)", 
      "made a filtering pipeline to preprocess + validate time-series data, and used mcmc methods to process radial velocity data",
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
