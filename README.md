# 🌐 Web Sitemap Analyzer

A powerful web application that crawls any website, maps its internal structure, classifies links, detects broken URLs, and generates an exportable sitemap — all from a sleek, modern interface.

🔗 **Live Demo:** [https://web-sitemap-analyzer.vercel.app/](https://web-sitemap-analyzer.vercel.app/)

> 📄 **README.md contains complete setup and usage instructions.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **🔍 Smart Crawling** — BFS-based crawler discovers internal pages up to a configurable depth
- **🔗 Link Classification** — Automatically separates internal vs. external links
- **🚨 Broken Link Detection** — Identifies dead links with HTTP status codes and error details
- **📊 Dashboard Summary** — At-a-glance cards showing pages discovered, link counts, and broken links
- **📤 Export** — Download results as **JSON** or **CSV** for further analysis
- **⚙️ Configurable** — Adjust max pages (up to 50) and crawl depth (up to 5)
- **🎨 Modern UI** — Clean dark-themed interface built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | Next.js 15 (App Router)     |
| Language    | TypeScript                  |
| Styling     | Tailwind CSS                |
| HTML Parser | Cheerio                     |
| Runtime     | Node.js 18+                 |
| Deployment  | Vercel (Serverless)         |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm

### Installation

```bash
git clone https://github.com/Udaya-Reddy-397/web-sitemap-analyzer.git
cd web-sitemap-analyzer
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 Usage

1. **Enter a URL** — Type any website URL into the input field
2. **Configure** — Optionally set Max Pages and Max Depth
3. **Analyze** — Click **"Analyze Website"** and wait for the crawl to complete
4. **Review** — Browse the results across three tabs:
   - **Pages & Sitemap** — Table of discovered pages with status, depth, and link counts
   - **Broken Links** — List of broken/dead links with error details and source pages
   - **Export** — Download the full report as JSON or CSV

---

## 🏗️ Architecture

### How the Crawler Works

```
User Input (URL)
      │
      ▼
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  API Route  │────▶│  BFS Crawler     │────▶│  Link Extractor│
│  /api/analyze│    │  (Queue-based)   │     │  (Cheerio)     │
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

### Key Design Decisions

- **BFS Traversal** — Pages are crawled breadth-first, ensuring shallow pages are discovered first
- **URL Normalization** — Lowercases hostnames, strips fragments and trailing slashes to prevent duplicate visits
- **Cycle Prevention** — A `Set` of visited normalized URLs eliminates infinite loops
- **Polite Crawling** — Sequential requests with 8-second timeouts avoid overwhelming target servers
- **Two-Pass Broken Link Check** — Links found during crawling are verified in a second pass for accurate reporting

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/analyze/
│   │   │   └── route.ts        # Serverless API endpoint for crawling
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main UI (input form, results dashboard)
│   └── lib/
│       ├── crawler.ts          # Core BFS crawler, URL normalization, link extraction
│       └── types.ts            # TypeScript interfaces (PageInfo, BrokenLink, CrawlResult)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ☁️ Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repository — Vercel auto-detects Next.js
4. Click **Deploy**

No environment variables required.

---

## ⚠️ Known Limitations

| Limitation | Details |
|---|---|
| Client-rendered content | Uses static HTML parsing (Cheerio). Links rendered only via JavaScript won't be discovered. |
| Serverless timeouts | Vercel Hobby plan has function duration limits. Max pages/depth are capped accordingly. |
| No `robots.txt` support | The crawler does not check `robots.txt` directives. |
| Sequential requests | Requests are made sequentially to remain polite and avoid rate limiting. |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript & Tailwind CSS
</p>

