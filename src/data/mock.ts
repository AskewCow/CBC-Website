export type Project = {
  id: number;
  name: string;
  description: string;
  builder: string;
  builtWith: "claude-api" | "claude-code" | "claude-web" | "other";
  github: string;
  published: boolean;
  tags: string[];
};

export type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "hackathon" | "workshop" | "salon" | "tabling" | "committee";
  description: string;
  upcoming: boolean;
  attendees?: number;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
  postedBy: string;
};

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "TCD Course Planner",
    description:
      "Parses the Trinity module handbook and recommends course combinations based on your CAO points, major, and career goals. Handles prerequisite chains automatically.",
    builder: "Sarah Chen",
    builtWith: "claude-api",
    github: "https://github.com/sarahchen/tcd-course-planner",
    published: true,
    tags: ["education", "typescript", "next.js"],
  },
  {
    id: 2,
    name: "Research Paper Summarizer",
    description:
      "Batch-processes PDFs from arXiv or DOI links, generates structured summaries with key findings, methodology, and limitations. Built for postgrad researchers.",
    builder: "James O'Brien",
    builtWith: "claude-api",
    github: "https://github.com/jamesobrien/paper-summarizer",
    published: true,
    tags: ["research", "python", "fastapi"],
  },
  {
    id: 3,
    name: "Lab Report Assistant",
    description:
      "Guides science students through lab report structure — formats results tables, suggests discussion points, checks against departmental rubrics.",
    builder: "Priya Nair",
    builtWith: "claude-code",
    github: "https://github.com/priyanair/lab-report-ai",
    published: true,
    tags: ["education", "react", "claude-code"],
  },
  {
    id: 4,
    name: "Trinity Events Bot",
    description:
      "Scrapes the college events calendar, clusters related events, and sends personalised daily digests via Discord. 120 active subscribers in first week.",
    builder: "Adam Walsh",
    builtWith: "claude-api",
    github: "https://github.com/adamwalsh/trinity-events-bot",
    published: true,
    tags: ["discord", "python", "scraping"],
  },
  {
    id: 5,
    name: "Code Review Companion",
    description:
      "Reviews pull requests using Claude Code, leaves structured inline comments, checks for common security issues, and suggests test cases for uncovered branches.",
    builder: "Liu Wei",
    builtWith: "claude-code",
    github: "https://github.com/liuwei/code-review-companion",
    published: true,
    tags: ["devtools", "typescript", "github-actions"],
  },
  {
    id: 6,
    name: "Cúpla Focal",
    description:
      "Irish language conversation partner. Corrects grammar in real time, explains idioms, and tracks vocabulary growth over sessions. Built for Leaving Cert prep.",
    builder: "Seán Byrne",
    builtWith: "claude-api",
    github: "https://github.com/seanbyrne/cupla-focal",
    published: true,
    tags: ["language", "education", "svelte"],
  },
  {
    id: 7,
    name: "Student Budget Tracker",
    description:
      "Categorises bank statement exports, flags unusual spending, and generates a plain-English monthly summary. Trained on typical Dublin student expense patterns.",
    builder: "Maria Kovač",
    builtWith: "claude-web",
    github: "https://github.com/mariakovac/student-budget",
    published: true,
    tags: ["fintech", "vue", "python"],
  },
  {
    id: 8,
    name: "Dissertation Outline Generator",
    description:
      "Turns a thesis statement and bibliography into a structured chapter outline with argument flows and suggested evidence slots. Supports 12 citation styles.",
    builder: "Aoife Murphy",
    builtWith: "claude-api",
    github: "https://github.com/aoifemurphy/dissertation-ai",
    published: true,
    tags: ["academia", "react", "node.js"],
  },
];

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "Hackathon: Build in 48h",
    date: "2025-10-11",
    time: "10:00",
    location: "Lloyd Institute, Room 1.05",
    type: "hackathon",
    description:
      "48-hour hackathon. Ship something real with Claude by Sunday evening. Teams of 2–4 or solo. API credits provided. Judged on ambition and execution.",
    upcoming: true,
  },
  {
    id: 2,
    title: "Workshop: Claude API for Beginners",
    date: "2025-10-05",
    time: "14:00",
    location: "Hamilton Building, Room G01",
    type: "workshop",
    description:
      "Zero-to-deployed in 90 minutes. We'll wire up an Anthropic API key, write a basic chat loop, and deploy it to Vercel. Bring a laptop.",
    upcoming: true,
  },
  {
    id: 3,
    title: "Research Salon: LLMs in Academia",
    date: "2025-10-19",
    time: "16:00",
    location: "Ussher Library, Seminar Room 2",
    type: "salon",
    description:
      "Roundtable on how large language models are changing research workflows. Members present 5-minute lightning demos followed by open discussion.",
    upcoming: true,
  },
  {
    id: 4,
    title: "Tabling: Freshers' Week",
    date: "2025-09-15",
    time: "11:00",
    location: "Front Square",
    type: "tabling",
    description:
      "Come say hello at our Freshers' Week table. Ask questions, see what members have built, and sign up for the club. No experience needed.",
    upcoming: false,
    attendees: 34,
  },
  {
    id: 5,
    title: "Workshop: Getting Started with Claude Code",
    date: "2025-09-07",
    time: "15:00",
    location: "Science Gallery, Seminar Room",
    type: "workshop",
    description:
      "First meeting of the year. We'll cover Claude Code setup, basic prompting strategies, and the club's project submission process. Bring a laptop.",
    upcoming: false,
    attendees: 28,
  },
  {
    id: 6,
    title: "Project Showcase: End of Hilary Term",
    date: "2025-03-14",
    time: "17:00",
    location: "Lloyd Institute, Lecture Theatre 2",
    type: "workshop",
    description:
      "End-of-term showcase. Members present completed projects to an audience of students and a panel of guests from industry.",
    upcoming: false,
    attendees: 41,
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Hackathon registrations now open",
    body: "Sign up for the October 11–13 hackathon in #hackathon-signup on Discord. Teams of 2–4 or solo. We're providing $50 in Anthropic API credits per team. Deadline is October 5th — slots are limited.",
    date: "2025-09-28",
    pinned: true,
    postedBy: "AskewCow",
  },
  {
    id: 2,
    title: "API credits available for active members",
    body: "We've secured a grant of API credits for members actively working on a club project. DM a committee member on Discord with a one-line description of what you're building and we'll sort you out.",
    date: "2025-09-22",
    pinned: false,
    postedBy: "AskewCow",
  },
  {
    id: 3,
    title: "Welcome to Michaelmas term 2025",
    body: "New year, new builds. Eight projects from last year are now live in the showcase — check them out at /projects. This term we're running a hackathon in October and a research salon series. See you in Discord.",
    date: "2025-09-01",
    pinned: false,
    postedBy: "AskewCow",
  },
  {
    id: 4,
    title: "CBC wins DUCSS Project of the Year",
    body: "The Trinity Events Bot by Adam Walsh took the prize at the Dublin University Computer Science Society awards ceremony. Huge congratulations to Adam and everyone who tested it.",
    date: "2025-05-15",
    pinned: false,
    postedBy: "AskewCow",
  },
  {
    id: 5,
    title: "Six new projects added to the showcase",
    body: "Following the end-of-term vote, six more member projects have been published to the site. Head to /projects to see what's been shipped this term.",
    date: "2025-03-20",
    pinned: false,
    postedBy: "AskewCow",
  },
];

export const clubStats = {
  members: 47,
  projectsShipped: 23,
  eventsRun: 12,
};
