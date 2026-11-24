import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterArticles } from './lib/newsFilter.ts';
import { fetchNewsWire, generateBroadcastSummary } from './services/newsClient.ts';
import type {
  BroadcastSummary,
  BroadcastTone,
  FilterState,
  NewsArticle,
  NewsLanguage,
} from './types/news.ts';
import { TopNav, type AppView } from './components/TopNav.tsx';
import { MobileTabBar } from './components/MobileTabBar.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { WireFeed } from './components/WireFeed.tsx';
import { BroadcastDesk } from './components/BroadcastDesk.tsx';
import { SavedQueue } from './components/SavedQueue.tsx';
import { BlueprintGuide } from './components/BlueprintGuide.tsx';

const SAVED_QUEUE_KEY = 'meridian-wire-rundown-v1';

function loadSavedQueue(): NewsArticle[] {
  try {
    const raw = window.localStorage.getItem(SAVED_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NewsArticle[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('wire');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [feedMode, setFeedMode] = useState<'live' | 'mixed' | 'archive'>('archive');
  const [liveSourcesCount, setLiveSourcesCount] = useState(0);
  const [totalSourcesCount, setTotalSourcesCount] = useState(12);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    topic: 'All',
    country: 'All',
    language: 'All',
    query: '',
  });

  const [savedQueue, setSavedQueue] = useState<NewsArticle[]>(() => loadSavedQueue());
  const [selectedForBroadcast, setSelectedForBroadcast] = useState<NewsArticle[]>([]);
  const [broadcastTone, setBroadcastTone] = useState<BroadcastTone>('Evening Anchor');
  const [broadcastLanguage, setBroadcastLanguage] = useState<NewsLanguage>('English');
  const [broadcastSummary, setBroadcastSummary] = useState<BroadcastSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const loadFeed = useCallback(async (forceRefresh = false) => {
    setIsLoadingFeed(true);
    setFeedError(null);
    try {
      const data = await fetchNewsWire(forceRefresh);
      setArticles(data.articles);
      setFeedMode(data.mode);
      setLiveSourcesCount(data.liveSourcesCount);
      setTotalSourcesCount(data.totalSourcesCount);
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Unable to fetch news wire.');
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed(false);
  }, [loadFeed]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_QUEUE_KEY, JSON.stringify(savedQueue));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedQueue]);

  const filteredArticles = useMemo(() => filterArticles(articles, filters), [articles, filters]);

  const savedIds = useMemo(() => new Set(savedQueue.map((item) => item.id)), [savedQueue]);

  const handleToggleSave = (article: NewsArticle) => {
    setSavedQueue((prev) => {
      const exists = prev.some((item) => item.id === article.id);
      if (exists) {
        return prev.filter((item) => item.id !== article.id);
      }
      return [article, ...prev];
    });
  };

  const handleMoveSaved = (index: number, direction: -1 | 1) => {
    setSavedQueue((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const runBroadcastGeneration = async (
    targetArticles: NewsArticle[],
    tone: BroadcastTone,
    language: NewsLanguage,
  ) => {
    if (targetArticles.length === 0) return;
    setIsGenerating(true);
    setBroadcastError(null);
    try {
      const result = await generateBroadcastSummary({
        articles: targetArticles,
        tone,
        outputLanguage: language,
      });
      setBroadcastSummary(result);
    } catch (err) {
      setBroadcastSummary(null);
      setBroadcastError(
        err instanceof Error ? err.message : 'Failed to format story for broadcast.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectForBroadcast = (article: NewsArticle) => {
    const batch = [article];
    setSelectedForBroadcast(batch);
    setBroadcastSummary(null);
    setBroadcastError(null);
    setActiveView('broadcast');
    void runBroadcastGeneration(batch, broadcastTone, broadcastLanguage);
  };

  const handleCompileRundown = () => {
    const batch = savedQueue.slice(0, 6);
    if (batch.length === 0) return;
    setSelectedForBroadcast(batch);
    setBroadcastSummary(null);
    setBroadcastError(null);
    setActiveView('broadcast');
    void runBroadcastGeneration(batch, broadcastTone, broadcastLanguage);
  };

  const handleUseLatestStory = () => {
    const first = filteredArticles[0] ?? articles[0];
    if (first) {
      handleSelectForBroadcast(first);
    } else {
      setActiveView('wire');
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413]">
      <TopNav
        activeView={activeView}
        onNavigate={setActiveView}
        onRefresh={() => void loadFeed(true)}
        isRefreshing={isLoadingFeed}
        savedCount={savedQueue.length}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-14">
        {activeView === 'wire' && (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              totalMatching={filteredArticles.length}
              totalAvailable={articles.length}
            />
            <WireFeed
              articles={filteredArticles}
              isLoading={isLoadingFeed}
              errorMessage={feedError}
              feedMode={feedMode}
              liveSourcesCount={liveSourcesCount}
              totalSourcesCount={totalSourcesCount}
              savedIds={savedIds}
              onSelectForBroadcast={handleSelectForBroadcast}
              onToggleSave={handleToggleSave}
              onResetFilters={() =>
                setFilters({ topic: 'All', country: 'All', language: 'All', query: '' })
              }
              onRetry={() => void loadFeed(true)}
            />
          </>
        )}

        {activeView === 'broadcast' && (
          <BroadcastDesk
            selectedArticles={selectedForBroadcast}
            summary={broadcastSummary}
            tone={broadcastTone}
            outputLanguage={broadcastLanguage}
            isGenerating={isGenerating}
            errorMessage={broadcastError}
            onToneChange={setBroadcastTone}
            onLanguageChange={setBroadcastLanguage}
            onGenerate={() =>
              void runBroadcastGeneration(
                selectedForBroadcast,
                broadcastTone,
                broadcastLanguage,
              )
            }
            onBackToWire={() => setActiveView('wire')}
            onUseLatestStory={handleUseLatestStory}
          />
        )}

        {activeView === 'saved' && (
          <SavedQueue
            articles={savedQueue}
            onMove={handleMoveSaved}
            onRemove={(id) =>
              setSavedQueue((prev) => prev.filter((item) => item.id !== id))
            }
            onClearAll={() => setSavedQueue([])}
            onCompileRundown={handleCompileRundown}
            onBackToWire={() => setActiveView('wire')}
          />
        )}

        {activeView === 'blueprint' && <BlueprintGuide />}
      </main>

      <footer className="hidden md:block border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-6 text-xs text-stone-500">
          <span>Meridian Wire — Global News Collection & Broadcast Desk</span>
          <button
            type="button"
            onClick={() => setActiveView('blueprint')}
            className="font-medium text-stone-700 hover:text-[#141413]"
          >
            View Project Structure & Deploy Guide
          </button>
        </div>
      </footer>

      <MobileTabBar
        activeView={activeView}
        onNavigate={setActiveView}
        savedCount={savedQueue.length}
      />
    </div>
  );
}
