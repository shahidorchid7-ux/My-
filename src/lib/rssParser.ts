import type { FeedSource, NewsArticle } from '../types/news.ts';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '-',
  mdash: '--',
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
  hellip: '...',
};

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : '';
    })
    .replace(/&([a-zA-Z]+);/g, (full, name: string) => {
      return NAMED_ENTITIES[name.toLowerCase()] ?? full;
    });
}

export function stripHtmlTags(input: string): string {
  const withoutScripts = input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const decoded = decodeHtmlEntities(withoutScripts);
  return decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function truncateSummary(text: string, maxLength = 240): string {
  const clean = text.trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  const sliced = clean.slice(0, maxLength - 3);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + '...';
}

function extractTagValue(block: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
}

function extractAtomLink(block: string): string {
  const altMatch = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (altMatch?.[1]) {
    return altMatch[1].trim();
  }
  const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch?.[1]) {
    return hrefMatch[1].trim();
  }
  return extractTagValue(block, 'link');
}

function normalizeIsoDate(rawDate: string, fallbackIso: string): string {
  if (!rawDate) {
    return fallbackIso;
  }
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackIso;
  }
  return parsed.toISOString();
}

function buildStableArticleId(sourceId: string, url: string, title: string): string {
  const raw = `${sourceId}:${url}:${title}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${sourceId}-${(hash >>> 0).toString(36)}`;
}

export function parseFeedXml(
  xml: string,
  source: FeedSource,
  nowIso = new Date().toISOString(),
  limit = 8,
): NewsArticle[] {
  if (!xml || typeof xml !== 'string') {
    return [];
  }

  const isAtom = /<feed[\s>]/i.test(xml) && /<entry[\s>]/i.test(xml);
  const itemPattern = isAtom
    ? /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi
    : /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;

  const articles: NewsArticle[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemPattern.exec(xml)) !== null && articles.length < limit) {
    const block = match[1];
    const rawTitle = extractTagValue(block, 'title');
    const title = stripHtmlTags(rawTitle);
    if (!title) {
      continue;
    }

    const rawLink = isAtom ? extractAtomLink(block) : extractTagValue(block, 'link');
    const decodedLink = decodeHtmlEntities(rawLink).trim();
    if (!isSafeHttpUrl(decodedLink)) {
      continue;
    }

    const rawDescription =
      extractTagValue(block, 'description') ||
      extractTagValue(block, 'summary') ||
      extractTagValue(block, 'content:encoded') ||
      extractTagValue(block, 'content');

    const cleanSummary = truncateSummary(stripHtmlTags(rawDescription) || title, 240);
    const rawDate =
      extractTagValue(block, 'pubDate') ||
      extractTagValue(block, 'published') ||
      extractTagValue(block, 'updated') ||
      extractTagValue(block, 'dc:date');

    articles.push({
      id: buildStableArticleId(source.id, decodedLink, title),
      title,
      summary: cleanSummary,
      sourceName: source.name,
      sourceUrl: decodedLink,
      topic: source.topic,
      country: source.country,
      language: source.language,
      publishedAt: normalizeIsoDate(stripHtmlTags(rawDate), nowIso),
      isLiveFeed: true,
    });
  }

  return articles;
}
