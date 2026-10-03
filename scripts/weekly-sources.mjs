// Sources for the Weekly Mashup. Section order here is the order in the edition.
// Verify any new feed with curl before adding it (some sites return 403/HTML).
//
// catchupDays: for slow feeds (monthly releases). The item is still included
// when it is newer than this, and is flagged so the edition says it is a
// catch-up item rather than this week's news.
// keywords: optional relevance filter, matched against title and snippet.

export const sections = ["AI", "QSR", "Testing"];

export const sources = [
  // AI
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", section: "AI" },
  { name: "Google AI", url: "https://blog.google/technology/ai/rss/", section: "AI" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/", section: "AI" },
  {
    name: "TechCrunch AI",
    url: "https://www.techcrunch.com/category/artificial-intelligence/feed/",
    section: "AI",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage?points=300",
    section: "AI",
    keywords: [
      "ai",
      "llm",
      "gpt",
      "claude",
      "gemini",
      "openai",
      "anthropic",
      "agent",
      "model",
      "testing",
      "playwright",
      "selenium",
      "qa",
    ],
  },

  // QSR
  { name: "Restaurant Dive", url: "https://www.restaurantdive.com/feeds/news/", section: "QSR" },
  { name: "Nation's Restaurant News", url: "https://www.nrn.com/rss.xml", section: "QSR" },
  {
    name: "Modern Restaurant Management",
    url: "https://www.modernrestaurantmanagement.com/feed/",
    section: "QSR",
  },

  // Testing and engineering
  { name: "Martin Fowler", url: "https://martinfowler.com/feed.atom", section: "Testing" },
  {
    name: "Playwright releases",
    url: "https://github.com/microsoft/playwright/releases.atom",
    section: "Testing",
    catchupDays: 45,
  },
];
