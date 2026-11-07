# 🌐 Web Sitemap Analyzer

A powerful web application that crawls any website, maps its internal structure, classifies internal and external links, detects broken URLs, and generates an exportable sitemap — all from a sleek, modern interface.

🔗 **Live Demo:** [web-sitemap-analyzer.vercel.app](https://web-sitemap-analyzer.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 Smart Crawling | BFS-based crawler discovers internal pages up to a configurable depth |
| 🔗 Link Classification | Automatically separates internal vs. external links on each page |
| 🚨 Broken Link Detection | Identifies dead links with HTTP status codes and error details |
| 📊 Dashboard Summary | At-a-glance cards showing pages discovered, link counts, and broken links |
| 📤 Export | Download the full analysis report as **JSON** or **CSV** |
| ⚙️ Configurable | Adjust max pages (up to 50) and crawl depth (up to 5) |
| 🎨 Modern UI | Clean dark-themed responsive interface built with Tailwind CSS |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| HTML Parser | [Cheerio](https://cheerio.js.org/) |
| Runtime | Node.js 18+ |
| Deployment | [Vercel](https://vercel.com/) (Serverless) |

---

## 🚀 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/Udaya-Reddy-397/web-sitemap-analyzer.git
cd web-sitemap-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production (Optional)

```bash
npm run build
npm start
```

---

## 📖 How to Use

1. Open the app at [web-sitemap-analyzer.vercel.app](https://web-sitemap-analyzer.vercel.app/) or your local server
2. Enter any website URL into the input field
3. Optionally adjust **Max Pages** and **Max Depth** settings
4. Click **"Analyze Website"** and wait for the crawl to complete
5. Browse the results across three tabs:

| Tab | What It Shows |
|-----|---------------|
| **Pages & Sitemap** | Table of all discovered pages with title, status, depth, and link counts |
| **Broken Links** | List of broken/dead links with error details and the page they were found on |
| **Export** | Download buttons for the full report in JSON or CSV format |

---

## 🏗️ How It Works

```
User Input (URL)
      │
      ▼
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  API Route  │────▶│  BFS Crawler     │────▶│  Link Extractor│
│ /api/analyze│     │  (Queue-based)   │     │  (Cheerio)     │
└─────────────┘     └──────────────────┘     └────────────────┘
                           │                         │
                           ▼                         ▼
                    ┌──────────────┐          ┌──────────────┐
                    │  Broken Link │          │  URL          │
                    │  Checker     │          │  Normalizer   │
                    └──────────────┘          └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  JSON Result │──▶ Dashboard / Export
                    └──────────────┘
```

**Key design decisions:**

- **BFS Traversal** — Crawls breadth-first so shallow pages are discovered first
- **URL Normalization** — Lowercases hostnames, strips fragments and trailing slashes to prevent duplicate visits
- **Cycle Prevention** — A `Set` of visited URLs eliminates infinite loops
- **Polite Crawling** — Sequential requests with 8-second timeouts to avoid overwhelming target servers
- **Two-Pass Verification** — Links found during crawling are verified in a second pass for accurate broken link reporting

---

## 📁 Project Structure

```
web-sitemap-analyzer/
├── src/
│   ├── app/
│   │   ├── api/analyze/
│   │   │   └── route.ts        # Serverless API endpoint for crawling
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main UI — input form, results dashboard, export
│   └── lib/
│       ├── crawler.ts          # Core BFS crawler, URL normalization, link extraction
│       └── types.ts            # TypeScript interfaces (PageInfo, BrokenLink, CrawlResult)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Setup and usage instructions
```

---

## ☁️ Deployment

The app is deployed on **Vercel** and available at:

👉 [https://web-sitemap-analyzer.vercel.app/](https://web-sitemap-analyzer.vercel.app/)

To deploy your own instance:

1. Fork or push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repository — Vercel auto-detects Next.js
4. Click **Deploy**

No environment variables are required.

---

## ⚠️ Limitations

| Limitation | Details |
|---|---|
| Client-rendered content | Uses static HTML parsing (Cheerio). Links rendered only via client-side JavaScript won't be discovered. |
| Serverless timeouts | Vercel Hobby plan has function duration limits. Max pages/depth are capped accordingly. |
| No `robots.txt` support | The crawler does not check `robots.txt` directives. |
| Sequential requests | Requests are made one at a time to remain polite and avoid rate limiting. |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
