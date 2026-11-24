import { useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Mic, Sparkles } from 'lucide-react';
import type {
  BroadcastSummary,
  BroadcastTone,
  NewsArticle,
  NewsLanguage,
} from '../types/news.ts';

interface BroadcastDeskProps {
  selectedArticles: NewsArticle[];
  summary: BroadcastSummary | null;
  tone: BroadcastTone;
  outputLanguage: NewsLanguage;
  isGenerating: boolean;
  errorMessage: string | null;
  onToneChange: (tone: BroadcastTone) => void;
  onLanguageChange: (language: NewsLanguage) => void;
  onGenerate: () => void;
  onBackToWire: () => void;
  onUseLatestStory: () => void;
}

const TONES: BroadcastTone[] = [
  'Breaking Desk',
  'Evening Anchor',
  'Morning Briefing',
  'Concise Ticker',
];

const LANGUAGES: NewsLanguage[] = [
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
];

export function BroadcastDesk({
  selectedArticles,
  summary,
  tone,
  outputLanguage,
  isGenerating,
  errorMessage,
  onToneChange,
  onLanguageChange,
  onGenerate,
  onBackToWire,
  onUseLatestStory,
}: BroadcastDeskProps) {
  const [teleprompterLarge, setTeleprompterLarge] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    if (!summary) return;
    const combined = `${summary.chyronHeadline}\n\nLEAD: ${summary.anchorLead}\n\n${summary.teleprompterScript}`;
    try {
      await navigator.clipboard.writeText(combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (selectedArticles.length === 0) {
    return (
      <section className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">
          Broadcast Desk
        </h1>
        <p className="mt-3 text-base text-stone-600">
          Select any story from the Wire Feed or compile your Saved Queue to generate a lower-third chyron, anchor lead, and teleprompter script.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onUseLatestStory}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            <span>Load Lead Story</span>
          </button>
          <button
            type="button"
            onClick={onBackToWire}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-[#141413] hover:bg-stone-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Browse Wire Feed</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Broadcast formatting desk" className="py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <button
            type="button"
            onClick={onBackToWire}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#141413] mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Wire Feed</span>
          </button>
          <h1 className="font-serif text-3xl font-semibold text-[#141413]">
            Broadcast Desk
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Formatting {selectedArticles.length} {selectedArticles.length === 1 ? 'dispatch' : 'dispatches'} for on-air delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>{isGenerating ? 'Formatting Copy...' : 'Generate Broadcast Script'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls & Source Dispatches */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
            <div>
              <span className="block text-xs font-semibold tracking-wide text-stone-700 mb-2">
                Broadcast Tone
              </span>
              <div role="group" aria-label="Broadcast tone" className="grid grid-cols-2 gap-2">
                {TONES.map((item) => {
                  const active = tone === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onToneChange(item)}
                      aria-pressed={active}
                      className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors ${
                        active
                          ? 'border-[#141413] bg-[#141413] text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="broadcast-language"
                className="block text-xs font-semibold tracking-wide text-stone-700 mb-2"
              >
                Broadcast Output Language
              </label>
              <select
                id="broadcast-language"
                value={outputLanguage}
                onChange={(e) => onLanguageChange(e.target.value as NewsLanguage)}
                className="min-h-[44px] w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#141413] focus:border-[#141413] focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <h2 className="font-serif text-lg font-semibold text-[#141413]">
              Source Wire Input
            </h2>
            <div className="divide-y divide-stone-100">
              {selectedArticles.map((article) => (
                <div key={article.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
                    <span className="font-medium text-stone-800">{article.sourceName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.country}</span>
                  </div>
                  <p className="text-sm font-medium text-[#141413] leading-snug">
                    {article.title}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">{article.summary}</p>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:underline pt-1"
                  >
                    <span>Verify source dispatch</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Teleprompter & Chyron Output */}
        <div className="lg:col-span-7 space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900"
            >
              <p className="font-semibold">Broadcast generation could not complete</p>
              <p className="mt-1 text-red-800">{errorMessage}</p>
            </div>
          )}

          {isGenerating && (
            <div className="rounded-xl border border-stone-200 bg-[#141413] p-8 text-[#FAF9F6] space-y-4 animate-pulse">
              <div className="h-4 w-40 rounded bg-stone-700" />
              <div className="h-8 w-full rounded bg-stone-800" />
              <div className="h-28 w-full rounded bg-stone-800" />
            </div>
          )}

          {!isGenerating && !summary && !errorMessage && (
            <div className="rounded-xl border border-stone-200 bg-white p-10 text-center space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#141413]">
                Ready for Broadcast Formatting
              </h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Choose your editorial tone and output language on the left, then click Generate Broadcast Script to produce teleprompter-ready copy.
              </p>
            </div>
          )}

          {!isGenerating && summary && (
            <div className="space-y-6">
              {/* Lower-Third Chyron Preview */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-700">Lower-Third Chyron Graphic</span>
                  <span className="font-mono tabular-nums">{summary.chyronHeadline.length} chars</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-900 text-white">
                  <div className="flex items-stretch">
                    <div className="bg-[#B91C1C] px-4 py-3 flex items-center justify-center text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                      {summary.tone}
                    </div>
                    <div className="px-4 py-3 flex-1 min-w-0">
                      <p className="font-serif text-base sm:text-lg font-semibold leading-tight text-white">
                        {summary.chyronHeadline}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Teleprompter Panel */}
              <div className="rounded-xl bg-[#141413] p-6 sm:p-8 text-[#FAF9F6] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="font-medium text-stone-200">Studio Teleprompter</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Est. {summary.estimatedSeconds}s read
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTeleprompterLarge((prev) => !prev)}
                      className="min-h-[36px] rounded-md border border-stone-700 px-3 py-1 text-xs font-medium text-stone-200 hover:bg-stone-800"
                    >
                      {teleprompterLarge ? 'Standard Type' : 'Large Type'}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs font-medium text-[#141413] hover:bg-stone-200"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Anchor Lead
                    </span>
                    <p
                      className={`mt-1.5 font-serif font-medium text-stone-100 leading-snug ${
                        teleprompterLarge ? 'text-2xl' : 'text-xl'
                      }`}
                    >
                      {summary.anchorLead}
                    </p>
                  </div>

                  <div className="border-t border-stone-800 pt-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Spoken Teleprompter Copy
                    </span>
                    <p
                      className={`mt-2 leading-relaxed text-stone-100 whitespace-pre-line ${
                        teleprompterLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                      }`}
                    >
                      {summary.teleprompterScript}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fact Verification Bullets */}
              {summary.keyFacts.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                  <h2 className="font-serif text-lg font-semibold text-[#141413]">
                    Desk Fact-Check Summary
                  </h2>
                  <ul className="space-y-2 text-sm text-stone-700 list-disc pl-5">
                    {summary.keyFacts.map((fact, index) => (
                      <li key={index} className="leading-relaxed">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
