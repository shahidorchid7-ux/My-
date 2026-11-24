import { RefreshCw } from 'lucide-react';

export type AppView = 'wire' | 'broadcast' | 'saved' | 'blueprint';

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  savedCount: number;
}

export function TopNav({
  activeView,
  onNavigate,
  onRefresh,
  isRefreshing,
  savedCount,
}: TopNavProps) {
  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'wire', label: 'Wire Feed' },
    { id: 'broadcast', label: 'Broadcast Desk' },
    { id: 'saved', label: savedCount > 0 ? `Saved Queue (${savedCount})` : 'Saved Queue' },
    { id: 'blueprint', label: 'API & Deploy' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#FAF9F6]/95 backdrop-blur-md">
      <div className="mx-auto flex h-13 md:h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('wire');
          }}
          className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-800"
        >
          Meridian Wire
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-800 ${
                  isActive
                    ? 'text-[#141413]'
                    : 'text-stone-600 hover:text-[#141413]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#B91C1C]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh news wire"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#141413] px-4 py-2 text-xs font-medium text-[#FAF9F6] transition-colors duration-150 hover:bg-stone-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRefreshing ? 'Updating...' : 'Refresh Wire'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
