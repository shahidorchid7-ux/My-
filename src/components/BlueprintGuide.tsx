import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const PROJECT_TREE = `meridian-wire/
├── .env.example              # GEMINI_API_KEY, APP_URL, optional NEWS_API_KEY
├── index.html                # Editorial typography & OpenGraph metadata
├── package.json              # Express + Vite scripts (dev, build, start)
├── server.ts                 # Express API routes (/api/news, /api/broadcast/summarize)
└── src/
    ├── types/news.ts         # NewsArticle, FilterState, BroadcastSummary contracts
    ├── data/
    │   ├── feedSources.ts    # Allowlisted international RSS registry
    │   └── archiveDispatches.ts # Deterministic fallback dispatches
    ├── lib/
    │   ├── rssParser.ts      # Pure RSS 2.0 / Atom 1.0 parser + URL/HTML sanitization
    │   ├── newsFilter.ts     # Filtering, deduplication, and read-time math
    │   └── rssParser.test.ts # Node built-in unit tests (node:test)
    ├── services/newsClient.ts # Typed browser fetch wrappers
    └── components/
        ├── TopNav.tsx        # Desktop 3-zone header & mobile top bar
        ├── MobileTabBar.tsx  # Mobile thumb-zone navigation bar
        ├── FilterBar.tsx     # Topic, country, language, and search controls
        ├── WireFeed.tsx      # 3-tier editorial news feed with source links
        ├── BroadcastDesk.tsx # Teleprompter, chyron, and Gemini formatter
        ├── SavedQueue.tsx    # LocalStorage rundown queue & batch compiler
        └── BlueprintGuide.tsx # Project structure, sample code, and deploy docs`;

const GEMINI_SAMPLE_CODE = `import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

export async function summarizeForBroadcast(articles: Array<{
  title: string;
  summary: string;
  sourceName: string;
}>, tone = 'Evening Anchor', language = 'English') {
  const digest = articles
    .map((a, i) => \`[\${i + 1}] \${a.sourceName}: \${a.title} — \${a.summary}\`)
    .join('\\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: \`Format for live broadcast:\\n\${digest}\`,
    config: {
      systemInstruction: \`You are a broadcast news producer. Respond in \${language} using \${tone} cadence.\`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chyronHeadline: { type: Type.STRING },
          anchorLead: { type: Type.STRING },
          teleprompterScript: { type: Type.STRING },
          keyFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['chyronHeadline', 'anchorLead', 'teleprompterScript', 'keyFacts'],
      },
    },
  });

  return JSON.parse(response.text ?? '{}');
}`;

const RSS_FETCH_SAMPLE = `// Server-side allowlisted RSS collector (prevents SSRF & sanitizes markup)
export async function fetchAllowlistedFeed(sourceUrl: string) {
  const res = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(4500),
    headers: { Accept: 'application/rss+xml, application/xml' },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseFeedXml(xml, source);
}

// Optional NewsAPI / GNews extension via server-side NEWS_API_KEY:
// const apiUrl = new URL('https://newsapi.org/v2/top-headlines');
// apiUrl.searchParams.set('category', topic.toLowerCase());
// const apiRes = await fetch(apiUrl, { headers: { 'X-Api-Key': process.env.NEWS_API_KEY } });`;

export function BlueprintGuide() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyBlock = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section aria-label="Architecture, API connection, and deployment guide" className="py-8 space-y-10 max-w-5xl">
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">
          Architecture, Gemini Sample Code & Deployment
        </h1>
        <p className="text-base text-stone-600 max-w-3xl leading-relaxed">
          Reference blueprint for this production-ready news collection and broadcast system: modular project layout, server-side Gemini summarization, external news API wiring, and deployment steps.
        </p>
      </div>

      {/* Section 1: Project Structure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[#141413]">
            01. Modular Project Structure
          </h2>
          <button
            type="button"
            onClick={() => copyBlock('tree', PROJECT_TREE)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            {copiedId === 'tree' ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'tree' ? 'Copied' : 'Copy Tree'}</span>
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-[#141413] p-5 text-xs sm:text-sm font-mono leading-relaxed text-stone-200">
          {PROJECT_TREE}
        </pre>
      </div>

      {/* Section 2: Gemini Broadcast Sample Code */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[#141413]">
            02. Gemini Broadcast Summarization (Server-Side)
          </h2>
          <button
            type="button"
            onClick={() => copyBlock('gemini', GEMINI_SAMPLE_CODE)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            {copiedId === 'gemini' ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'gemini' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <p className="text-sm text-stone-600">
          Uses the <code className="font-mono text-xs bg-stone-200/70 px-1.5 py-0.5 rounded">@google/genai</code> SDK on the Express server with structured JSON output (<code className="font-mono text-xs bg-stone-200/70 px-1.5 py-0.5 rounded">responseSchema</code>) so API keys remain strictly server-side.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-[#141413] p-5 text-xs sm:text-sm font-mono leading-relaxed text-stone-200">
          {GEMINI_SAMPLE_CODE}
        </pre>
      </div>

      {/* Section 3: RSS & News API Integration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[#141413]">
            03. Connecting RSS Feeds & News APIs
          </h2>
          <button
            type="button"
            onClick={() => copyBlock('rss', RSS_FETCH_SAMPLE)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            {copiedId === 'rss' ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'rss' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-[#141413] p-5 text-xs sm:text-sm font-mono leading-relaxed text-stone-200">
          {RSS_FETCH_SAMPLE}
        </pre>
      </div>

      {/* Section 4: Environment & Production Deployment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-3">
          <h3 className="font-serif text-xl font-semibold text-[#141413]">
            Environment & Secrets Setup
          </h3>
          <ol className="space-y-2 text-sm text-stone-700 list-decimal pl-5 leading-relaxed">
            <li>
              Set <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> in AI Studio Secrets or your hosting environment variables.
            </li>
            <li>
              Optionally set <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">NEWS_API_KEY</code> to supplement allowlisted RSS feeds with NewsAPI or GNews endpoints.
            </li>
            <li>
              Add new curated RSS publishers in <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">src/data/feedSources.ts</code> to expand regions or languages safely.
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-3">
          <h3 className="font-serif text-xl font-semibold text-[#141413]">
            Build & Production Deployment
          </h3>
          <ol className="space-y-2 text-sm text-stone-700 list-decimal pl-5 leading-relaxed">
            <li>
              Verify unit tests: <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">npx tsx --test src/lib/rssParser.test.ts</code>
            </li>
            <li>
              Compile frontend assets: <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">npm run build</code>
            </li>
            <li>
              Start production server on port 3000: <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">NODE_ENV=production npm start</code>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
