import type { RequestHandler } from "express";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import type { WinnerProject, WinnersResponse } from "@shared/api";

const RSS_SOURCES = [
  {
    name: "MLH Blog",
    url: "https://mlh.io/blog/feed",
  },
  {
    name: "Dev.to #hackathon",
    url: "https://dev.to/feed/tag/hackathon",
  },
  {
    name: "Hashnode Townhall",
    url: "https://townhall.hashnode.com/rss",
  },
];

const ARTICLE_WINNER_HINTS = [
  "winner",
  "winners",
  "top",
  "prize",
  "finalist",
  "finalists",
  "result",
  "results",
  "announc",
];

const PROJECT_URL_PATTERNS: { source: string; test: (href: string) => boolean }[] = [
  { source: "devpost", test: (h) => /(^|\.)devpost\.com\/.+/.test(h) },
  { source: "challengepost", test: (h) => /challengepost\.com\/.+/.test(h) },
  { source: "devfolio", test: (h) => /devfolio\.co\/.+/.test(h) },
  { source: "hackster", test: (h) => /hackster\.io\/.+/.test(h) },
  { source: "github", test: (h) => /github\.com\/.+/.test(h) },
  { source: "gitlab", test: (h) => /gitlab\.com\/.+/.test(h) },
  { source: "medium", test: (h) => /medium\.com\/.+/.test(h) },
];

const OG_IMAGE_SELECTORS = [
  'meta[property="og:image"]',
  'meta[name="og:image"]',
  'meta[name="twitter:image"]',
  'meta[property="twitter:image"]',
];

let CACHE: { at: number; data: WinnersResponse } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 minutes

export const handleWinners: RequestHandler = async (req, res) => {
  try {
    if (CACHE && Date.now() - CACHE.at < TTL_MS) {
      res.json(CACHE.data);
      return;
    }

    const items = await fetchRssItems();
    const candidateArticles = items.filter((it) => isLikelyWinnersArticle(it));

    const projects: WinnerProject[] = [];
    const seen = new Set<string>();

    for (const art of candidateArticles.slice(0, 10)) {
      try {
        const html = await fetchText(art.link);
        const $ = cheerio.load(html);
        const anchors = $('a[href]')
          .toArray()
          .map((a) => {
            const href = new URL($(a).attr('href')!, art.link).toString();
            const text = $(a).text().trim();
            return { href, text };
          });

        for (const a of anchors) {
          const src = PROJECT_URL_PATTERNS.find((p) => p.test(a.href));
          if (!src) continue;
          if (seen.has(a.href)) continue;
          seen.add(a.href);

          const project: WinnerProject = {
            title: a.text || prettifyTitleFromUrl(a.href),
            url: a.href,
            source: src.source,
            image: null,
            publishedAt: art.pubDate ?? null,
            description: null,
            tags: [],
          };

          // Try to fetch project Open Graph image (best-effort, with timeout)
          try {
            const phtml = await fetchText(a.href, 8000);
            const $$ = cheerio.load(phtml);
            for (const sel of OG_IMAGE_SELECTORS) {
              const og = $$(sel).attr('content');
              if (og) {
                project.image = new URL(og, a.href).toString();
                break;
              }
            }
            // Fallback: page title
            const pt = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
            if (pt && (!project.title || project.title.length < 3)) project.title = pt;
          } catch {
            // ignore
          }

          projects.push(project);
          if (projects.length >= 50) break;
        }
        if (projects.length >= 50) break;
      } catch {
        // skip article errors
      }
    }

    const resp: WinnersResponse = {
      projects,
      fetchedAt: new Date().toISOString(),
      sources: RSS_SOURCES.map((s) => s.name),
    };

    CACHE = { at: Date.now(), data: resp };
    res.json(resp);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
};

async function fetchRssItems() {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const items: { title: string; link: string; pubDate?: string; description?: string }[] = [];
  for (const src of RSS_SOURCES) {
    try {
      const xml = await fetchText(src.url);
      const data = parser.parse(xml);
      const channel = data?.rss?.channel;
      const list = (channel?.item || []) as any[];
      for (const it of list) {
        const title = String(it.title || '').trim();
        const link = String(it.link || '').trim();
        const pubDate = it.pubDate ? String(it.pubDate) : undefined;
        const description = it.description ? String(it.description) : undefined;
        if (title && link) items.push({ title, link, pubDate, description });
      }
    } catch {
      // ignore source errors
    }
  }
  // Sort newest first
  items.sort((a, b) => (new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()));
  return items;
}

function isLikelyWinnersArticle(it: { title: string; description?: string }) {
  const t = (it.title + ' ' + (it.description || '')).toLowerCase();
  return ARTICLE_WINNER_HINTS.some((h) => t.includes(h));
}

function prettifyTitleFromUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(path.replace(/[-_]+/g, ' ')).replace(/\b\w/g, (m) => m.toUpperCase());
  } catch {
    return url;
  }
}

async function fetchText(url: string, timeoutMs = 15000): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (Fusion Hackathon Aggregator)' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(id);
  }
}
