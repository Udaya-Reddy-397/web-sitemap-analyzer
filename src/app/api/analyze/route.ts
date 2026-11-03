import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/crawler";

export const maxDuration = 60; // Allow longer on Vercel Pro; free plan is limited

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, maxPages = 30, maxDepth = 3 } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Basic validation
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { error: "Only http and https URLs are supported" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please include http:// or https://" },
        { status: 400 }
      );
    }

    const result = await crawlWebsite(url, {
      maxPages: Math.min(Number(maxPages) || 30, 50),
      maxDepth: Math.min(Number(maxDepth) || 3, 5),
      timeoutMs: 8000,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Crawl error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze website" },
      { status: 500 }
    );
  }
}
