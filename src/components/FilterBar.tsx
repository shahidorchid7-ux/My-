import { Search, X } from 'lucide-react';
import type { FilterState, NewsCountry, NewsLanguage, NewsTopic } from '../types/news.ts';

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalMatching: number;
  totalAvailable: number;
}

const TOPICS: Array<NewsTopic | 'All'> = [
  'All',
  'World',
  'Technology',
  'Finance',
  'Science',
  'Policy',
  'Climate',
];

const COUNTRIES: Array<NewsCountry | 'All'> = [
  'All',
  'Global',
  'United States',
  'United Kingdom',
  'European Union',
  'Japan',
  'Middle East',
];

const LANGUAGES: Array<NewsLanguage | 'All'> = [
  'All',
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
];

export function FilterBar({
  filters,
  onChange,
  totalMatching,
  totalAvailable,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.topic !== 'All' ||
    filters.country !== 'All' ||
    filters.language !== 'All' ||
    filters.query.trim().length > 0;

  return (
    <section aria-label="Wire filters" className="border-b border-stone-200 pb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter by topic"
            className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl bg-stone-100 p-1"
          >
            {TOPICS.map((topic) => {
              const isSelected = filters.topic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onChange({ ...filters, topic })}
                  aria-pressed={isSelected}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-800 ${
                    isSelected
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-stone-600 hover:text-[#141413]'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-mono tabular-nums text-stone-500">
            Showing {totalMatching} of {totalAvailable} dispatches
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className={hasActiveFilters ? 'lg:col-span-5' : 'lg:col-span-6'}>
            <label htmlFor="wire-search" className="sr-only">
              Search headlines or sources
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="wire-search"
                type="search"
                value={filters.query}
                onChange={(e) => onChange({ ...filters, query: e.target.value })}
                placeholder="Search headlines, topics, or wire sources..."
                className="min-h-[44px] w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-[#141413] placeholder:text-stone-400 focus:border-[#141413] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="country-filter" className="sr-only">
              Filter by country or region
            </label>
            <select
              id="country-filter"
              value={filters.country}
              onChange={(e) =>
                onChange({ ...filters, country: e.target.value as NewsCountry | 'All' })
              }
              className="min-h-[44px] w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#141413] focus:border-[#141413] focus:outline-none"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country === 'All' ? 'All Regions / Countries' : country}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="language-filter" className="sr-only">
              Filter by language
            </label>
            <select
              id="language-filter"
              value={filters.language}
              onChange={(e) =>
                onChange({ ...filters, language: e.target.value as NewsLanguage | 'All' })
              }
              className="min-h-[44px] w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#141413] focus:border-[#141413] focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'All' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="lg:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() =>
                  onChange({ topic: 'All', country: 'All', language: 'All', query: '' })
                }
                aria-label="Reset all filters"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
