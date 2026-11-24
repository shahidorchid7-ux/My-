import { Bookmark, Code2, Newspaper, Radio } from 'lucide-react';
import type { AppView } from './TopNav.tsx';

interface MobileTabBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  savedCount: number;
}

export function MobileTabBar({ activeView, onNavigate, savedCount }: MobileTabBarProps) {
  const tabs: Array<{
    id: AppView;
    label: string;
    icon: typeof Newspaper;
  }> = [
    { id: 'wire', label: 'Wire', icon: Newspaper },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
    { id: 'saved', label: savedCount > 0 ? `Queue (${savedCount})` : 'Queue', icon: Bookmark },
    { id: 'blueprint', label: 'Deploy', icon: Code2 },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-[#FAF9F6]/95 backdrop-blur-md md:hidden"
    >
      <div className="grid h-14 grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-red-800 ${
                isActive ? 'text-[#B91C1C]' : 'text-stone-600 hover:text-[#141413]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
