# Website Sitemap Analyzer

**BashCraft Web Development Recruitment Task**

A professional web application that crawls a website, discovers internal pages, classifies internal vs external links, detects broken links, and generates a structured, exportable sitemap.

**Primary demonstration target:** https://bashcraftclub.vercel.app/

---

## Features

- URL Input with validation and clear error handling
- Internal page discovery via BFS crawl
- URL normalization (trailing slashes, hostname casing, fragments)
- Duplicate and loop prevention using a visited set
- Internal vs External link classification
- Broken-link detection (HTTP status + network/timeout errors)
- Structured sitemap with page title, URL, depth, and link counts
- Export to JSON and CSV
- Configurable max pages and max depth
- Clean, formal, professional UI

---

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- HTML Parsing: Cheerio
- Runtime: Node.js (Vercel Serverless)
- Deployment: Vercel

---

## Prerequisites

- Node.js 18+
- npm

---

## Installation and Setup

```bash
git clone <your-repo-url>
cd website-sitemap-analyzer
npm install
npm run dev
```

Open http://localhost:3000

---

## How to Use

1. Enter a website URL (default is pre-filled with the BashCraft site).
2. Optionally adjust Max Pages (default 25) and Max Depth (default 3).
3. Click Analyze Website.
4. Review the summary cards, pages table, and broken-links list.
5. Switch to the Export tab and download JSON or CSV.

---

## Architecture and Design Decisions

### Crawling Approach
Breadth-first search (BFS) using a queue. Each page is fetched with an 8-second timeout. Only internal links (same hostname) are enqueued for further crawling. External links are recorded but never followed.

### URL Normalization
- Lowercase hostname
- Remove URL fragments
- Strip trailing slash (except for the root path)
This prevents treating variations of the same URL as different pages.

### Duplicate and Loop Handling
A Set of normalized URLs tracks already-visited pages. Pages already in the set are skipped, eliminating cycles.

### Broken-Link Detection
After discovering links, the crawler checks HTTP status (and network errors) for internal links. Status >= 400 or network/timeout failures are reported as broken, together with the page on which the link was found.

### Export
- JSON: Full structured result (pages, broken links, summary)
- CSV: Flattened page table for easy spreadsheet use

### Known Limitations

| Limitation | Note |
|------------|------|
| JavaScript-rendered links | Uses static HTML parsing (Cheerio). Links injected purely by client-side JavaScript are not discovered. The BashCraft site is a React SPA, so many navigation links may not appear in the initial HTML. |
| Serverless time limits | On Vercel Hobby plan the maximum function duration is limited. The app caps pages/depth to stay within safe limits. |
| No robots.txt | Not implemented (optional enhancement). |
| Sequential requests | Requests are sequential to be polite and avoid rate limits. |

---

## BashCraft Demonstration

- URL used: https://bashcraftclub.vercel.app/
- The analyzer was tested against this site.
- Because the site is a client-side rendered React application, the number of discoverable static links is limited. This is an expected limitation of static crawlers and is clearly documented.

---

## Testing Notes

| Test Case | Expected | Actual |
|-----------|----------|--------|
| Valid URL (BashCraft) | Returns pages + summary | Pass |
| Invalid URL format | Clear 400 error | Pass |
| Unreachable host | Error / broken status | Pass |
| Max pages limit | Stops at configured limit | Pass |
| Circular links | No infinite loop | Pass |
| Export JSON/CSV | Downloads correctly | Pass |
| Missing title | Shows "(No title)" | Pass |

---

## Project Structure

```
src/
  app/
    api/analyze/route.ts   # Serverless crawl endpoint
    layout.tsx
    page.tsx               # Main UI
    globals.css
  lib/
    crawler.ts             # Core crawling + normalization logic
    types.ts
```

---

## Deployment on Vercel

1. Push this repository to GitHub.
2. Go to vercel.com → Add New Project.
3. Import the GitHub repository.
4. Vercel auto-detects Next.js. Click Deploy.
5. Your live URL will be https://<project-name>.vercel.app

No environment variables are required.

---

## Evaluation Criteria Coverage

- Correct core functionality (crawl, normalize, classify, detect broken links, export)
- Logical handling of loops, duplicates, and edge cases
- Clean, readable, maintainable code
- Complete README + technical documentation
- Testing notes and limitations documented
- Ready for Vercel deployment
