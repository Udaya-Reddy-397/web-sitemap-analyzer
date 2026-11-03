import * as cheerio from "cheerio";
import type { PageInfo, BrokenLink, CrawlResult, CrawlOptions } from "./types";

/**
 * Normalize a URL to avoid treating variations as different pages.
 * - Removes trailing slash (except for root)
 * - Lowercases hostname
 * - Removes hash fragments
 * - Removes common tracking query params (optional, kept simple)
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl);
    // Only http/https
    if (!["http:", "https:"].includes(url.protocol)) return null;

    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    // Remove trailing slash for non-root paths
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    url.pathname = pathname || "/";

    // Optionally strip search params that are usually tracking
    // Keeping all search params for accuracy; can be extended later

    return url.href;
  } catch {
    return null;
  }
}

function isSameHost(urlA: string, urlB: string): boolean {
  try {
    return new URL(urlA).hostname === new URL(urlB).hostname;
  } catch {
    return false;
  }
}

async function fetchPage(
  url: string,
  timeoutMs: number
): Promise<{ status: number | null; html: string | null; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "BashCraft-SitemapAnalyzer/1.0 (+https://github.com/bashcraft-task)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timer);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { status: res.status, html: null, error: "Not an HTML page" };
    }

    const html = await res.text();
    return { status: res.status, html };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return { status: null, html: null, error: "Timeout" };
    }
    return {
      status: null,
      html: null,
      error: err.message || "Network error",
    };
  }
}

function extractLinks(
  html: string,
  pageUrl: string
): { internal: string[]; external: string[] } {
  const $ = cheerio.load(html);
  const internal: string[] = [];
  const external: string[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, pageUrl);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);

    if (isSameHost(normalized, pageUrl)) {
      internal.push(normalized);
    } else {
      external.push(normalized);
    }
  });

  return { internal, external };
}

function extractTitle(html: string): string {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  if (!title) return "(No title)";
  // Truncate extremely long titles
  return title.length > 200 ? title.slice(0, 197) + "..." : title;
}

/**
 * Main crawler function.
 * Performs a BFS crawl starting from startUrl.
 */
export async function crawlWebsite(
  startUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const maxPages = options.maxPages ?? 40;
  const maxDepth = options.maxDepth ?? 4;
  const timeoutMs = options.timeoutMs ?? 8000;

  const normalizedStart = normalizeUrl(startUrl);
  if (!normalizedStart) {
    throw new Error("Invalid start URL");
  }

  const baseHost = new URL(normalizedStart).hostname;
  const visited = new Set<string>();
  const pages: PageInfo[] = [];
  const allBrokenLinks: BrokenLink[] = [];

  // Queue: [url, depth]
  const queue: [string, number][] = [[normalizedStart, 0]];
  const startTime = Date.now();

  while (queue.length > 0 && pages.length < maxPages) {
    const [currentUrl, depth] = queue.shift()!;

    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    if (depth > maxDepth) continue;

    const { status, html, error } = await fetchPage(currentUrl, timeoutMs);

    const page: PageInfo = {
      url: currentUrl,
      title: "(Unable to load)",
      status,
      error,
      internalLinks: [],
      externalLinks: [],
      brokenLinks: [],
      depth,
    };

    if (html && status && status >= 200 && status < 400) {
      page.title = extractTitle(html);
      const { internal, external } = extractLinks(html, currentUrl);
      page.internalLinks = internal;
      page.externalLinks = external;

      // Check internal links for broken status (only if we haven't visited them yet
      // and we still have budget). We do a light check later for report.
      for (const link of internal) {
        if (!visited.has(link) && depth + 1 <= maxDepth) {
          queue.push([link, depth + 1]);
        }
      }
    } else {
      // This page itself is broken / unreachable
      allBrokenLinks.push({
        url: currentUrl,
        status,
        error: error || `HTTP ${status}`,
        foundOn: depth === 0 ? "(start URL)" : "crawl",
      });
    }

    pages.push(page);
  }

  // Second pass: check status of all discovered internal links that were not fully crawled
  // (to populate brokenLinks per page without extra deep crawling)
  const linkStatusCache = new Map<string, { status: number | null; error?: string }>();

  async function getLinkStatus(url: string) {
    if (linkStatusCache.has(url)) return linkStatusCache.get(url)!;
    const result = await fetchPage(url, timeoutMs);
    const info = { status: result.status, error: result.error };
    linkStatusCache.set(url, info);
    return info;
  }

  for (const page of pages) {
    if (!page.internalLinks.length) continue;

    for (const link of page.internalLinks) {
      // If we already visited and it had an error, mark it
      const already = pages.find((p) => p.url === link);
      if (already && (already.error || (already.status && already.status >= 400))) {
        const broken: BrokenLink = {
          url: link,
          status: already.status,
          error: already.error || `HTTP ${already.status}`,
          foundOn: page.url,
        };
        page.brokenLinks.push(broken);
        if (!allBrokenLinks.some((b) => b.url === link && b.foundOn === page.url)) {
          allBrokenLinks.push(broken);
        }
        continue;
      }

      // Otherwise do a quick status check (only a few to stay within time limits)
      if (linkStatusCache.size < 30) {
        const info = await getLinkStatus(link);
        if (info.error || (info.status && info.status >= 400)) {
          const broken: BrokenLink = {
            url: link,
            status: info.status,
            error: info.error || `HTTP ${info.status}`,
            foundOn: page.url,
          };
          page.brokenLinks.push(broken);
          allBrokenLinks.push(broken);
        }
      }
    }
  }

  const totalInternal = pages.reduce((s, p) => s + p.internalLinks.length, 0);
  const totalExternal = pages.reduce((s, p) => s + p.externalLinks.length, 0);

  return {
    startUrl: normalizedStart,
    baseHost,
    pages,
    allBrokenLinks,
    summary: {
      totalPages: pages.length,
      totalInternalLinks: totalInternal,
      totalExternalLinks: totalExternal,
      totalBrokenLinks: allBrokenLinks.length,
      crawlDurationMs: Date.now() - startTime,
    },
    crawledAt: new Date().toISOString(),
  };
}
