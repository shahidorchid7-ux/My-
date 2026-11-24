import type { FilterState, NewsArticle } from '../types/news.ts';

export function filterArticles(articles: NewsArticle[], filters: FilterState): NewsArticle[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return articles
    .filter((article) => {
      if (filters.topic !== 'All' && article.topic !== filters.topic) {
        return false;
      }
      if (filters.country !== 'All' && article.country !== filters.country) {
        return false;
      }
      if (filters.language !== 'All' && article.language !== filters.language) {
        return false;
      }
      if (normalizedQuery) {
        const haystack = `${article.title} ${article.summary} ${article.sourceName} ${article.topic} ${article.country}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: NewsArticle[] = [];

  for (const article of articles) {
    const normalizedTitle = article.title.trim().toLowerCase();
    const normalizedUrl = article.sourceUrl.trim().toLowerCase();
    if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitle)) {
      continue;
    }
    seenUrls.add(normalizedUrl);
    seenTitles.add(normalizedTitle);
    result.push(article);
  }

  return result;
}

export function formatRelativeTime(isoDate: string, nowMs = Date.now()): string {
  const parsedMs = new Date(isoDate).getTime();
  if (Number.isNaN(parsedMs)) {
    return 'Recent';
  }
  const diffMinutes = Math.max(0, Math.floor((nowMs - parsedMs) / 60000));
  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function estimateReadSeconds(scriptText: string, wordsPerMinute = 145): number {
  const words = scriptText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) {
    return 0;
  }
  return Math.max(5, Math.round((words / wordsPerMinute) * 60));
}

export function selectEditorialTiers(articles: NewsArticle[]): {
  lead: NewsArticle | null;
  spotlights: NewsArticle[];
  dispatches: NewsArticle[];
} {
  if (articles.length === 0) {
    return { lead: null, spotlights: [], dispatches: [] };
  }

  const lead = articles[0];
  const remaining = articles.slice(1);
  const spotlights: NewsArticle[] = [];
  const usedTopics = new Set<string>([lead.topic]);

  // First pass: pick up to 2 spotlight stories from distinct topics
  for (const candidate of remaining) {
    if (spotlights.length >= 2) break;
    if (!usedTopics.has(candidate.topic)) {
      spotlights.push(candidate);
      usedTopics.add(candidate.topic);
    }
  }

  // Second pass: fill remaining spotlight slots if fewer than 2 distinct topics exist
  for (const candidate of remaining) {
    if (spotlights.length >= 2) break;
    if (!spotlights.some((item) => item.id === candidate.id)) {
      spotlights.push(candidate);
    }
  }

  const spotlightIds = new Set(spotlights.map((item) => item.id));
  const dispatches = remaining.filter((item) => !spotlightIds.has(item.id));

  return { lead, spotlights, dispatches };
}
