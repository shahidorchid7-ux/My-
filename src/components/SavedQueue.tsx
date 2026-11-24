import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Mic, Trash2 } from 'lucide-react';
import type { NewsArticle } from '../types/news.ts';
import { formatRelativeTime } from '../lib/newsFilter.ts';

interface SavedQueueProps {
  articles: NewsArticle[];
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onCompileRundown: () => void;
  onBackToWire: () => void;
}

export function SavedQueue({
  articles,
  onMove,
  onRemove,
  onClearAll,
  onCompileRundown,
  onBackToWire,
}: SavedQueueProps) {
  if (articles.length === 0) {
    return (
      <section className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">
          Saved Rundown Queue
        </h1>
        <p className="mt-3 text-base text-stone-600">
          Your broadcast rundown is empty. Save dispatches from the Wire Feed to organize story order and compile a multi-story news bulletin.
        </p>
        <button
          type="button"
          onClick={onBackToWire}
          className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#141413] px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Explore Wire Feed</span>
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Saved broadcast rundown queue" className="py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#141413]">
            Saved Rundown Queue
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {articles.length} queued {articles.length === 1 ? 'story' : 'stories'} persisted locally. Up to 6 stories can be compiled into a single bulletin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Clear Queue</span>
          </button>

          <button
            type="button"
            onClick={onCompileRundown}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            <span>Compile Broadcast Rundown</span>
          </button>
        </div>
      </div>

      <ol className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {articles.map((article, index) => (
          <li
            key={article.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
                <span className="font-mono tabular-nums font-semibold text-[#B91C1C]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-stone-800">{article.topic}</span>
                <span aria-hidden="true">·</span>
                <span>{article.country}</span>
                <span aria-hidden="true">·</span>
                <span>{article.sourceName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {formatRelativeTime(article.publishedAt)}
                </span>
              </div>

              <h2 className="font-serif text-lg font-semibold text-[#141413]">
                {article.title}
              </h2>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-[#B91C1C]"
              >
                <span>Open source report</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`Move "${article.title}" up`}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-35"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === articles.length - 1}
                aria-label={`Move "${article.title}" down`}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-35"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onRemove(article.id)}
                aria-label={`Remove "${article.title}" from queue`}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
