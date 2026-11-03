"use client";

import { useState } from "react";
import type { CrawlResult, PageInfo } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("https://bashcraftclub.vercel.app/");
  const [maxPages, setMaxPages] = useState(25);
  const [maxDepth, setMaxDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [activeTab, setActiveTab] = useState<"pages" | "broken" | "export">("pages");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages, maxDepth }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      setActiveTab("pages");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sitemap-${result.baseHost}-${Date.now()}.json`;
    a.click();
  }

  function downloadCSV() {
    if (!result) return;
    const headers = [
      "URL",
      "Title",
      "Status",
      "Depth",
      "Internal Links",
      "External Links",
      "Broken Links",
      "Error",
    ];
    const rows = result.pages.map((p) => [
      `"${p.url}"`,
      `"${(p.title || "").replace(/"/g, '""')}"`,
      p.status ?? "",
      p.depth,
      p.internalLinks.length,
      p.externalLinks.length,
      p.brokenLinks.length,
      `"${(p.error || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sitemap-${result.baseHost}-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-sm">
              SA
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Sitemap Analyzer
              </h1>
              <p className="text-xs text-slate-400">
                BashCraft Web Development Task
              </p>
            </div>
          </div>
          <a
            href="https://bashcraftclub.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-red-400 transition"
          >
            Target Site ↗
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero / Intro */}
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Website Structure &amp; Link Analysis
          </h2>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Enter any website URL to discover internal pages, classify links,
            detect broken resources, and export a structured sitemap. Designed
            for reliability and clear reporting.
          </p>
        </section>

        {/* Input Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-5">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Website URL
              </label>
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxPages"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Max Pages
                </label>
                <input
                  id="maxPages"
                  type="number"
                  min={1}
                  max={50}
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="maxDepth"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Max Depth
                </label>
                <input
                  id="maxDepth"
                  type="number"
                  min={1}
                  max={5}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing…
                </>
              ) : (
                "Analyze Website"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-5 p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-sm">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard
                label="Pages Discovered"
                value={result.summary.totalPages}
              />
              <SummaryCard
                label="Internal Links"
                value={result.summary.totalInternalLinks}
              />
              <SummaryCard
                label="External Links"
                value={result.summary.totalExternalLinks}
              />
              <SummaryCard
                label="Broken Links"
                value={result.summary.totalBrokenLinks}
                highlight={result.summary.totalBrokenLinks > 0}
              />
            </div>

            <p className="text-xs text-slate-500">
              Crawled <span className="font-mono text-slate-400">{result.startUrl}</span> in{" "}
              {(result.summary.crawlDurationMs / 1000).toFixed(1)}s ·{" "}
              {new Date(result.crawledAt).toLocaleString()}
            </p>

            {/* Tabs */}
            <div className="border-b border-slate-800 flex gap-1">
              {(
                [
                  ["pages", "Pages & Sitemap"],
                  ["broken", "Broken Links"],
                  ["export", "Export"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                    activeTab === key
                      ? "border-red-600 text-red-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "pages" && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Page</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Depth</th>
                      <th className="px-4 py-3 font-medium text-center">Internal</th>
                      <th className="px-4 py-3 font-medium text-center">External</th>
                      <th className="px-4 py-3 font-medium text-center">Broken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.pages.map((page) => (
                      <PageRow key={page.url} page={page} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "broken" && (
              <div className="space-y-3">
                {result.allBrokenLinks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl">
                    No broken links detected.
                  </div>
                ) : (
                  result.allBrokenLinks.map((b, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-red-300 truncate">
                          {b.url}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Found on:{" "}
                          <span className="font-mono">{b.foundOn}</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-950 text-red-300 border border-red-800">
                        {b.error || `HTTP ${b.status}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "export" && (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
                <p className="text-sm text-slate-400">
                  Download the complete analysis report in a structured format.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadJSON}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition"
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer note */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            Built for the BashCraft Web Development Recruitment Task · Deployed
            on Vercel
          </p>
          <p className="mt-1">
            Primary demonstration target:{" "}
            <a
              href="https://bashcraftclub.vercel.app/"
              className="text-slate-400 hover:text-red-400"
            >
              https://bashcraftclub.vercel.app/
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold tabular-nums ${
          highlight ? "text-red-400" : "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PageRow({ page }: { page: PageInfo }) {
  const isBroken = page.error || (page.status && page.status >= 400);
  return (
    <tr className="hover:bg-slate-900/50 transition">
      <td className="px-4 py-3">
        <div className="max-w-xs sm:max-w-md">
          <p className="font-medium text-slate-200 truncate" title={page.title}>
            {page.title}
          </p>
          <p className="font-mono text-xs text-slate-500 truncate mt-0.5">
            {page.url}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        {isBroken ? (
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-950 text-red-300">
            {page.error || page.status}
          </span>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300">
            {page.status ?? "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-slate-400">{page.depth}</td>
      <td className="px-4 py-3 text-center text-slate-300">
        {page.internalLinks.length}
      </td>
      <td className="px-4 py-3 text-center text-slate-300">
        {page.externalLinks.length}
      </td>
      <td className="px-4 py-3 text-center">
        {page.brokenLinks.length > 0 ? (
          <span className="text-red-400 font-medium">
            {page.brokenLinks.length}
          </span>
        ) : (
          <span className="text-slate-500">0</span>
        )}
      </td>
    </tr>
  );
}
