import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { ALLOWLISTED_FEED_SOURCES } from './src/data/feedSources.ts';
import { getArchiveDispatches } from './src/data/archiveDispatches.ts';
import { parseFeedXml } from './src/lib/rssParser.ts';
import { deduplicateArticles, estimateReadSeconds, filterArticles } from './src/lib/newsFilter.ts';
import type {
  BroadcastSummary,
  BroadcastTone,
  FilterState,
  NewsArticle,
  NewsCountry,
  NewsFeedResponse,
  NewsLanguage,
  NewsTopic,
} from './src/types/news.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const CACHE_TTL_MS = 3 * 60 * 1000;

interface FeedCache {
  data: NewsFeedResponse;
  expiresAt: number;
}

let cachedFeed: FeedCache | null = null;

const VALID_TONES: BroadcastTone[] = [
  'Breaking Desk',
  'Evening Anchor',
  'Morning Briefing',
  'Concise Ticker',
];

const VALID_TOPICS: Array<NewsTopic | 'All'> = [
  'All',
  'World',
  'Technology',
  'Finance',
  'Science',
  'Policy',
  'Climate',
];

const VALID_COUNTRIES: Array<NewsCountry | 'All'> = [
  'All',
  'Global',
  'United States',
  'United Kingdom',
  'European Union',
  'Japan',
  'Middle East',
];

const VALID_LANGUAGES: Array<NewsLanguage | 'All'> = [
  'All',
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
];

async function fetchSingleFeed(source: (typeof ALLOWLISTED_FEED_SOURCES)[number]): Promise<NewsArticle[]> {
  try {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': 'MeridianWire-RSSCollector/1.0 (+https://meridianwire.local)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9',
      },
    });
    if (!response.ok) {
      return [];
    }
    const xml = await response.text();
    return parseFeedXml(xml, source, new Date().toISOString(), 6);
  } catch {
    return [];
  }
}

async function collectAllFeeds(forceRefresh = false): Promise<NewsFeedResponse> {
  if (!forceRefresh && cachedFeed && Date.now() < cachedFeed.expiresAt) {
    return cachedFeed.data;
  }

  const results = await Promise.all(ALLOWLISTED_FEED_SOURCES.map((source) => fetchSingleFeed(source)));
  const liveSourcesCount = results.filter((items) => items.length > 0).length;
  const liveArticles = results.flat();

  let combined: NewsArticle[];
  let mode: NewsFeedResponse['mode'];

  if (liveArticles.length >= 12) {
    combined = deduplicateArticles(liveArticles);
    mode = 'live';
  } else if (liveArticles.length > 0) {
    combined = deduplicateArticles([...liveArticles, ...getArchiveDispatches()]);
    mode = 'mixed';
  } else {
    combined = getArchiveDispatches();
    mode = 'archive';
  }

  combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const payload: NewsFeedResponse = {
    articles: combined,
    fetchedAt: new Date().toISOString(),
    liveSourcesCount,
    totalSourcesCount: ALLOWLISTED_FEED_SOURCES.length,
    mode,
  };

  cachedFeed = {
    data: payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return payload;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      sourcesCount: ALLOWLISTED_FEED_SOURCES.length,
    });
  });

  app.get('/api/news', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1';
      const feed = await collectAllFeeds(forceRefresh);

      const topicParam = typeof req.query.topic === 'string' ? req.query.topic : 'All';
      const countryParam = typeof req.query.country === 'string' ? req.query.country : 'All';
      const languageParam = typeof req.query.language === 'string' ? req.query.language : 'All';
      const queryParam = typeof req.query.q === 'string' ? req.query.q.slice(0, 120) : '';

      const filters: FilterState = {
        topic: VALID_TOPICS.includes(topicParam as FilterState['topic'])
          ? (topicParam as FilterState['topic'])
          : 'All',
        country: VALID_COUNTRIES.includes(countryParam as FilterState['country'])
          ? (countryParam as FilterState['country'])
          : 'All',
        language: VALID_LANGUAGES.includes(languageParam as FilterState['language'])
          ? (languageParam as FilterState['language'])
          : 'All',
        query: queryParam,
      };

      const filtered = filterArticles(feed.articles, filters);

      res.json({
        ...feed,
        articles: filtered,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to collect wire feeds';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/broadcast/summarize', async (req, res) => {
    const body = req.body as {
      articles?: Array<{
        title?: unknown;
        summary?: unknown;
        sourceName?: unknown;
        topic?: unknown;
        country?: unknown;
        language?: unknown;
      }>;
      tone?: unknown;
      outputLanguage?: unknown;
    };

    if (!body || !Array.isArray(body.articles) || body.articles.length === 0) {
      res.status(400).json({ error: 'Select at least one news story to format for broadcast.' });
      return;
    }

    if (body.articles.length > 6) {
      res.status(400).json({ error: 'Broadcast rundown generation supports up to 6 stories at once.' });
      return;
    }

    const sanitizedStories = body.articles
      .map((item) => ({
        title: typeof item.title === 'string' ? item.title.trim().slice(0, 280) : '',
        summary: typeof item.summary === 'string' ? item.summary.trim().slice(0, 1200) : '',
        sourceName: typeof item.sourceName === 'string' ? item.sourceName.trim().slice(0, 80) : 'Wire Desk',
        topic: typeof item.topic === 'string' ? item.topic.trim().slice(0, 40) : 'World',
        country: typeof item.country === 'string' ? item.country.trim().slice(0, 40) : 'Global',
      }))
      .filter((item) => item.title.length > 0);

    if (sanitizedStories.length === 0) {
      res.status(400).json({ error: 'Provided stories must include a valid headline.' });
      return;
    }

    const tone: BroadcastTone = VALID_TONES.includes(body.tone as BroadcastTone)
      ? (body.tone as BroadcastTone)
      : 'Evening Anchor';

    const outputLanguage =
      typeof body.outputLanguage === 'string' && VALID_LANGUAGES.includes(body.outputLanguage as NewsLanguage)
        ? body.outputLanguage
        : 'English';

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to generate live broadcast scripts.',
      });
      return;
    }

    const storyDigest = sanitizedStories
      .map(
        (story, idx) =>
          `[${idx + 1}] Source: ${story.sourceName} | Topic: ${story.topic} | Region: ${story.country}\nHeadline: ${story.title}\nDetails: ${story.summary}`,
      )
      .join('\n\n');

    const systemInstruction = [
      'You are an experienced international broadcast news producer writing teleprompter copy.',
      `Write all output fields in ${outputLanguage}.`,
      `Adopt the "${tone}" broadcast style:`,
      '- Breaking Desk: urgent, crisp, declarative present-tense sentences.',
      '- Evening Anchor: authoritative, measured cadence, smooth transitions between facts.',
      '- Morning Briefing: brisk, conversational clarity for commuters and listeners.',
      '- Concise Ticker: ultra-compact broadcast headline and 20-second flash read.',
      'Never invent facts, statistics, or quotes beyond the provided wire dispatches.',
      'Attribute facts naturally to the named source.',
    ].join('\n');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const parseGeminiErrorMessage = (err: unknown): { status: number; message: string } => {
      const raw = err instanceof Error ? err.message : 'Gemini broadcast generation failed.';
      let extracted = raw;
      let code = 500;
      try {
        const parsed = JSON.parse(raw) as { error?: { code?: number; message?: string } };
        if (parsed?.error?.message) {
          extracted = parsed.error.message;
        }
        if (typeof parsed?.error?.code === 'number') {
          code = parsed.error.code;
        }
      } catch {
        // Keep raw message if not JSON
      }

      if (code === 503 || raw.includes('503') || raw.includes('UNAVAILABLE')) {
        return {
          status: 503,
          message: 'The Gemini broadcast model is experiencing temporary high demand. Please retry in a few seconds.',
        };
      }
      if (code === 403 || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
        return {
          status: 403,
          message: 'Access to Gemini was denied. Verify your GEMINI_API_KEY in Settings > Secrets.',
        };
      }
      if (code === 429 || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
        return {
          status: 429,
          message: 'Gemini request quota reached. Please wait briefly or check your billing quota in Settings > Secrets.',
        };
      }
      return { status: code >= 400 && code < 600 ? code : 500, message: extracted };
    };

    try {
      let responseText = '';
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: `Format the following wire dispatch(es) for live broadcast:\n\n${storyDigest}`,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  chyronHeadline: {
                    type: Type.STRING,
                    description: 'Upper-or-title-case television lower-third chyron headline, maximum 75 characters.',
                  },
                  anchorLead: {
                    type: Type.STRING,
                    description: 'A sharp 1-sentence opening cue for the news anchor (15-24 words).',
                  },
                  teleprompterScript: {
                    type: Type.STRING,
                    description:
                      'Spoken-word teleprompter script with natural breath pauses (use // for short beat pauses), 65-140 words depending on story count.',
                  },
                  keyFacts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 3 verified factual bullet points drawn strictly from the wire text.',
                  },
                },
                required: ['chyronHeadline', 'anchorLead', 'teleprompterScript', 'keyFacts'],
              },
            },
          });
          responseText = (response.text ?? '').trim();
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          const info = parseGeminiErrorMessage(err);
          const isTransient = info.status === 503 || info.status === 429;
          if (!isTransient || attempt === 2) {
            throw err;
          }
          await sleep(700 * (attempt + 1));
        }
      }

      if (lastError) {
        throw lastError;
      }

      if (!responseText) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(responseText) as {
        chyronHeadline?: string;
        anchorLead?: string;
        teleprompterScript?: string;
        keyFacts?: string[];
      };

      const teleprompterScript = String(parsed.teleprompterScript ?? '').trim();
      const result: BroadcastSummary = {
        chyronHeadline: String(parsed.chyronHeadline ?? sanitizedStories[0].title).slice(0, 90),
        anchorLead: String(parsed.anchorLead ?? '').trim(),
        teleprompterScript,
        keyFacts: Array.isArray(parsed.keyFacts)
          ? parsed.keyFacts.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 4)
          : [],
        estimatedSeconds: estimateReadSeconds(teleprompterScript),
        tone,
        generatedAt: new Date().toISOString(),
        sourceCount: sanitizedStories.length,
      };

      res.json(result);
    } catch (err) {
      const info = parseGeminiErrorMessage(err);
      res.status(info.status).json({ error: info.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meridian Wire server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start Meridian Wire server:', err);
  process.exit(1);
});
