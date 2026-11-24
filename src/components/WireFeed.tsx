import { ArrowUpRight, Bookmark, Check, Mic } from 'lucide-react';
import type { NewsArticle } from '../types/news.ts';
import { formatRelativeTime, selectEditorialTiers } from '../lib/newsFilter.ts';
import { NewsImage } from './NewsImage.tsx';

interface WireFeedProps {
  articles: NewsArticle[];
  isLoading: boolean;
  errorMessage: string | null;
  feedMode: 'live' | 'mixed' | 'archive';
  liveSourcesCount: number;
  totalSourcesCount: number;
  savedIds: Set<string>;
  onSelectForBroadcast: (article: NewsArticle) => void;
  onToggleSave: (article: NewsArticle) => void;
  onResetFilters: () => void;
  onRetry: () => void;
}

export function WireFeed({
  articles,
  isLoading,
  errorMessage,
  feedMode,
  liveSourcesCount,
  totalSourcesCount,
  savedIds,
  onSelectForBroadcast,
  onToggleSave,
  onResetFilters,
  onRetry,
}: WireFeedProps) {
  if (isLoading && articles.length === 0) {
    return (
      <div className="py-16 space-y-8" aria-busy="true" aria-label="Loading wire dispatches">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7 aspect-[16/9] rounded-xl bg-stone-200" />
          <div className="lg:col-span-5 space-y-4 py-2">
            <div className="h-3 w-48 rounded bg-stone-200" />
            <div className="h-9 w-full rounded bg-stone-200" />
            <div className="h-9 w-4/5 rounded bg-stone-200" />
            <div className="h-20 w-full rounded bg-stone-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((slot) => (
            <div key={slot} className="h-48 rounded-xl bg-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMessage && articles.length === 0) {
    return (
      <div className="my-12 rounded-xl border border-red-200 bg-red-50/70 p-8 text-center">
        <h2 className="font-serif text-xl font-semibold text-[#141413]">
          Unable to reach news wire
        </h2>
        <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-[#141413] px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Retry Feed Collection
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="my-12 rounded-xl border border-stone-200 bg-white p-10 text-center">
        <h2 className="font-serif text-xl font-semibold text-[#141413]">
          No dispatches match your active filters
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Try clearing one or more topic, country, language, or keyword filters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-[#141413] px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  const { lead: leadArticle, spotlights: secondaryArticles, dispatches: wireDispatches } =
    selectEditorialTiers(articles);

  if (!leadArticle) {
    return null;
  }

  const feedOriginText =
    feedMode === 'live'
      ? `Live RSS aggregation active across ${liveSourcesCount} of ${totalSourcesCount} international feeds`
      : feedMode === 'mixed'
        ? `Live RSS (${liveSourcesCount} feeds) supplemented with curated wire dispatches`
        : 'Curated editorial wire archive active';

  return (
    <div className="space-y-12 pt-8">
      {/* Tier 1: Lead Story */}
      <article aria-label="Lead story" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-10 border-b border-stone-200">
        <div className="lg:col-span-7 overflow-hidden rounded-xl bg-stone-200">
          <NewsImage
            topic={leadArticle.topic}
            alt={`${leadArticle.topic} editorial scene for ${leadArticle.title}`}
            className="h-full w-full aspect-[16/9] object-cover"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
              <span className="font-semibold text-[#B91C1C]">Lead Dispatch</span>
              <span aria-hidden="true">·</span>
              <span>{leadArticle.topic}</span>
              <span aria-hidden="true">·</span>
              <span>{leadArticle.country}</span>
              <span aria-hidden="true">·</span>
              <span>{leadArticle.language}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatRelativeTime(leadArticle.publishedAt)}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-[#141413] text-balance">
              {leadArticle.title}
            </h1>

            <p className="text-base leading-relaxed text-stone-600">
              {leadArticle.summary}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-200 pt-4">
              <span>Source: {leadArticle.sourceName}</span>
              <a
                href={leadArticle.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#141413] hover:text-[#B91C1C] transition-colors"
              >
                <span>Original Report</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectForBroadcast(leadArticle)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-800 whitespace-nowrap"
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
                <span>Format for Broadcast</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(leadArticle)}
                aria-label={
                  savedIds.has(leadArticle.id)
                    ? `Remove "${leadArticle.title}" from saved queue`
                    : `Save "${leadArticle.title}" to queue`
                }
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                  savedIds.has(leadArticle.id)
                    ? 'border-[#141413] bg-[#141413] text-white'
                    : 'border-stone-300 bg-white text-[#141413] hover:bg-stone-100'
                }`}
              >
                {savedIds.has(leadArticle.id) ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Queued</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                    <span>Queue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Tier 2: Secondary Features */}
      {secondaryArticles.length > 0 && (
        <section aria-label="Featured dispatches" className="pb-10 border-b border-stone-200">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-[#141413]">
              Regional Spotlights
            </h2>
            <p className="text-xs text-stone-500">{feedOriginText}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondaryArticles.map((article, idx) => {
              const isSaved = savedIds.has(article.id);
              const needsOffset = article.topic === leadArticle.topic;
              return (
                <article
                  key={article.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5"
                >
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg bg-stone-100">
                      <NewsImage
                        topic={article.topic}
                        slotOffset={needsOffset ? idx + 1 : 0}
                        alt={`${article.topic} editorial image for ${article.title}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span className="font-medium text-stone-800">{article.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatRelativeTime(article.publishedAt)}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold leading-snug text-[#141413] text-balance">
                      {article.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-stone-600">{article.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1 text-xs font-medium text-stone-700 hover:text-[#B91C1C]"
                    >
                      <span>{article.sourceName}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleSave(article)}
                        aria-label={
                          isSaved
                            ? `Remove "${article.title}" from saved queue`
                            : `Save "${article.title}" to queue`
                        }
                        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSaved
                            ? 'border-[#141413] bg-[#141413] text-white'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {isSaved ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{isSaved ? 'Queued' : 'Queue'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectForBroadcast(article)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#B91C1C]"
                      >
                        <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Broadcast</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Tier 3: Live / Latest Wire Dispatches */}
      {wireDispatches.length > 0 && (
        <section aria-label="Latest wire dispatches">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold text-[#141413]">
              Latest Wire Dispatches
            </h2>
            <span className="text-xs font-mono tabular-nums text-stone-500">
              {wireDispatches.length} stories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wireDispatches.map((article) => {
              const isSaved = savedIds.has(article.id);
              return (
                <article
                  key={article.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span className="font-medium text-stone-800">{article.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatRelativeTime(article.publishedAt)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold leading-snug text-[#141413]">
                      {article.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-stone-600 line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] max-w-[140px] items-center gap-1 text-xs font-medium text-stone-600 hover:text-[#B91C1C]"
                    >
                      <span className="truncate">{article.sourceName}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleSave(article)}
                        aria-label={
                          isSaved
                            ? `Remove "${article.title}" from saved queue`
                            : `Save "${article.title}" to queue`
                        }
                        className={`inline-flex min-h-[36px] items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSaved
                            ? 'border-[#141413] bg-[#141413] text-white'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {isSaved ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <Bookmark className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectForBroadcast(article)}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-md bg-stone-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#B91C1C]"
                      >
                        <Mic className="h-3 w-3" aria-hidden="true" />
                        <span>Broadcast</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
