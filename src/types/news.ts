export type NewsTopic =
  | 'World'
  | 'Technology'
  | 'Finance'
  | 'Science'
  | 'Policy'
  | 'Climate';

export type NewsCountry =
  | 'Global'
  | 'United States'
  | 'United Kingdom'
  | 'European Union'
  | 'Japan'
  | 'Middle East';

export type NewsLanguage =
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Japanese';

export type BroadcastTone =
  | 'Breaking Desk'
  | 'Evening Anchor'
  | 'Morning Briefing'
  | 'Concise Ticker';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  topic: NewsTopic;
  country: NewsCountry;
  language: NewsLanguage;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  topic: NewsTopic;
  country: NewsCountry;
  language: NewsLanguage;
  publishedAt: string;
  isLiveFeed: boolean;
}

export interface FilterState {
  topic: NewsTopic | 'All';
  country: NewsCountry | 'All';
  language: NewsLanguage | 'All';
  query: string;
}

export interface BroadcastSummary {
  chyronHeadline: string;
  anchorLead: string;
  teleprompterScript: string;
  keyFacts: string[];
  estimatedSeconds: number;
  tone: BroadcastTone;
  generatedAt: string;
  sourceCount: number;
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
  fetchedAt: string;
  liveSourcesCount: number;
  totalSourcesCount: number;
  mode: 'live' | 'mixed' | 'archive';
}
