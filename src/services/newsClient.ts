import type {
  BroadcastSummary,
  BroadcastTone,
  NewsArticle,
  NewsFeedResponse,
  NewsLanguage,
} from '../types/news.ts';

export async function fetchNewsWire(refresh = false): Promise<NewsFeedResponse> {
  const url = refresh ? '/api/news?refresh=1' : '/api/news';
  const response = await fetch(url);
  const data = (await response.json()) as NewsFeedResponse & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load news wire.');
  }
  return data;
}

export async function generateBroadcastSummary(params: {
  articles: NewsArticle[];
  tone: BroadcastTone;
  outputLanguage: NewsLanguage;
}): Promise<BroadcastSummary> {
  const response = await fetch('/api/broadcast/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articles: params.articles.map((article) => ({
        title: article.title,
        summary: article.summary,
        sourceName: article.sourceName,
        topic: article.topic,
        country: article.country,
        language: article.language,
      })),
      tone: params.tone,
      outputLanguage: params.outputLanguage,
    }),
  });

  const data = (await response.json()) as BroadcastSummary & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Unable to generate broadcast summary.');
  }
  return data;
}
