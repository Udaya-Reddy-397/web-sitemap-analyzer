export interface PageInfo {
  url: string;
  title: string;
  status: number | null;
  error?: string;
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: BrokenLink[];
  depth: number;
}

export interface BrokenLink {
  url: string;
  status: number | null;
  error?: string;
  foundOn: string;
}

export interface CrawlResult {
  startUrl: string;
  baseHost: string;
  pages: PageInfo[];
  allBrokenLinks: BrokenLink[];
  summary: {
    totalPages: number;
    totalInternalLinks: number;
    totalExternalLinks: number;
    totalBrokenLinks: number;
    crawlDurationMs: number;
  };
  crawledAt: string;
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  timeoutMs?: number;
}
