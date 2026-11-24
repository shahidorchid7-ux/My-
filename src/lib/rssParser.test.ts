import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeHtmlEntities,
  isSafeHttpUrl,
  parseFeedXml,
  stripHtmlTags,
} from './rssParser.ts';
import {
  deduplicateArticles,
  estimateReadSeconds,
  filterArticles,
  formatRelativeTime,
  selectEditorialTiers,
} from './newsFilter.ts';
import type { FeedSource, NewsArticle } from '../types/news.ts';

const MOCK_SOURCE: FeedSource = {
  id: 'test-bbc',
  name: 'BBC Test',
  url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  topic: 'World',
  country: 'United Kingdom',
  language: 'English',
};

test('stripHtmlTags removes markup and decodes entities safely', () => {
  const dirty = '<p>Markets &amp; Policy: <strong>Shift</strong> &ldquo;Today&rdquo;<script>alert(1)</script></p>';
  assert.equal(stripHtmlTags(dirty), 'Markets & Policy: Shift "Today"');
  assert.equal(decodeHtmlEntities('<![CDATA[Breaking &mdash; Update]]>'), 'Breaking -- Update');
});

test('isSafeHttpUrl rejects javascript and data URIs', () => {
  assert.equal(isSafeHttpUrl('https://www.bbc.com/news/world-123'), true);
  assert.equal(isSafeHttpUrl('http://example.com/story'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeHttpUrl('not-a-url'), false);
});

test('parseFeedXml parses RSS 2.0 items and blocks unsafe links', () => {
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <item>
          <title><![CDATA[Central Bank Holds Rates &amp; Signals Patience]]></title>
          <link>https://example.com/rates</link>
          <description><![CDATA[<p>Officials cited cooling inflation.</p>]]></description>
          <pubDate>Tue, 24 Nov 2026 09:00:00 GMT</pubDate>
        </item>
        <item>
          <title>Malicious Link Item</title>
          <link>javascript:evil()</link>
          <description>Should be skipped</description>
        </item>
      </channel>
    </rss>`;

  const parsed = parseFeedXml(rssXml, MOCK_SOURCE, '2026-11-24T10:00:00.000Z');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].title, 'Central Bank Holds Rates & Signals Patience');
  assert.equal(parsed[0].summary, 'Officials cited cooling inflation.');
  assert.equal(parsed[0].sourceUrl, 'https://example.com/rates');
  assert.equal(parsed[0].publishedAt, '2026-11-24T09:00:00.000Z');
});

test('parseFeedXml parses Atom 1.0 entries correctly', () => {
  const atomXml = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <title>Grid Storage Milestone Reached</title>
        <link rel="alternate" href="https://example.com/atom-story" />
        <updated>2026-11-24T08:30:00Z</updated>
        <summary>Utility-scale batteries expanded 40 percent year over year.</summary>
      </entry>
    </feed>`;

  const parsed = parseFeedXml(atomXml, MOCK_SOURCE);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].title, 'Grid Storage Milestone Reached');
  assert.equal(parsed[0].sourceUrl, 'https://example.com/atom-story');
});

test('filterArticles filters by topic, country, language, and search query', () => {
  const sample: NewsArticle[] = [
    {
      id: '1',
      title: 'Semiconductor Pact Signed',
      summary: 'New wafer capacity announced.',
      sourceName: 'Ars',
      sourceUrl: 'https://example.com/1',
      topic: 'Technology',
      country: 'United States',
      language: 'English',
      publishedAt: '2026-11-24T09:00:00.000Z',
      isLiveFeed: true,
    },
    {
      id: '2',
      title: 'Acuerdo climático regional',
      summary: 'Nuevas metas de energía solar.',
      sourceName: 'BBC Mundo',
      sourceUrl: 'https://example.com/2',
      topic: 'Climate',
      country: 'Global',
      language: 'Spanish',
      publishedAt: '2026-11-24T09:30:00.000Z',
      isLiveFeed: true,
    },
  ];

  assert.equal(filterArticles(sample, { topic: 'Technology', country: 'All', language: 'All', query: '' }).length, 1);
  assert.equal(filterArticles(sample, { topic: 'All', country: 'All', language: 'Spanish', query: '' }).length, 1);
  assert.equal(filterArticles(sample, { topic: 'All', country: 'All', language: 'All', query: 'wafer' })[0].id, '1');
});

test('deduplicateArticles, formatRelativeTime, and estimateReadSeconds behave deterministically', () => {
  const dupes: NewsArticle[] = [
    {
      id: 'a',
      title: 'Headline One',
      summary: 'Body',
      sourceName: 'S1',
      sourceUrl: 'https://example.com/1',
      topic: 'World',
      country: 'Global',
      language: 'English',
      publishedAt: '2026-11-24T09:00:00.000Z',
      isLiveFeed: true,
    },
    {
      id: 'b',
      title: 'Headline One',
      summary: 'Body 2',
      sourceName: 'S2',
      sourceUrl: 'https://example.com/2',
      topic: 'World',
      country: 'Global',
      language: 'English',
      publishedAt: '2026-11-24T09:05:00.000Z',
      isLiveFeed: true,
    },
  ];

  assert.equal(deduplicateArticles(dupes).length, 1);
  assert.equal(formatRelativeTime('2026-11-24T09:45:00.000Z', Date.parse('2026-11-24T10:00:00.000Z')), '15m ago');
  assert.equal(estimateReadSeconds('word '.repeat(145), 145), 60);
});

test('selectEditorialTiers diversifies spotlight topics ahead of same-topic dispatches', () => {
  const mk = (id: string, topic: NewsArticle['topic']): NewsArticle => ({
    id,
    title: `Story ${id}`,
    summary: 'Summary',
    sourceName: 'Wire',
    sourceUrl: `https://example.com/${id}`,
    topic,
    country: 'Global',
    language: 'English',
    publishedAt: '2026-11-24T09:00:00.000Z',
    isLiveFeed: true,
  });

  const tiers = selectEditorialTiers([
    mk('1', 'World'),
    mk('2', 'World'),
    mk('3', 'Technology'),
    mk('4', 'Finance'),
    mk('5', 'World'),
  ]);

  assert.equal(tiers.lead?.id, '1');
  assert.deepEqual(
    tiers.spotlights.map((item) => item.id),
    ['3', '4'],
  );
  assert.deepEqual(
    tiers.dispatches.map((item) => item.id),
    ['2', '5'],
  );
});
