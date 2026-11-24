import type { NewsArticle } from '../types/news.ts';

export function getArchiveDispatches(referenceNow = new Date()): NewsArticle[] {
  const minutesAgo = (mins: number) => new Date(referenceNow.getTime() - mins * 60000).toISOString();

  return [
    {
      id: 'wire-global-grid-01',
      title: 'European Grid Operators Approve Cross-Border Interconnector Pact for North Sea Wind',
      summary:
        'Energy regulators from eight North Sea nations finalized joint transmission rules designed to balance offshore wind capacity across national borders by 2028.',
      sourceName: 'Deutsche Welle Europe',
      sourceUrl: 'https://www.dw.com/en/top-stories/s-9097',
      topic: 'Climate',
      country: 'European Union',
      language: 'English',
      publishedAt: minutesAgo(14),
      isLiveFeed: false,
    },
    {
      id: 'wire-tech-silicon-02',
      title: 'Optical Interconnect Standards Gain Backing as Data Center Power Demands Climb',
      summary:
        'Chipmakers and cloud infrastructure providers published a unified photonics specification aimed at reducing rack-to-rack cooling overhead in high-density clusters.',
      sourceName: 'Ars Technica Wire',
      sourceUrl: 'https://arstechnica.com/information-technology/',
      topic: 'Technology',
      country: 'United States',
      language: 'English',
      publishedAt: minutesAgo(32),
      isLiveFeed: false,
    },
    {
      id: 'wire-finance-gilts-03',
      title: 'Central Bank Liquidity Buffers Tighten Ahead of Quarterly Sovereign Bond Auctions',
      summary:
        'Institutional bond desks adjusted short-duration positioning after policymakers signaled a measured pace of balance-sheet normalization through the spring quarter.',
      sourceName: 'BBC Business Desk',
      sourceUrl: 'https://www.bbc.com/news/business',
      topic: 'Finance',
      country: 'United Kingdom',
      language: 'English',
      publishedAt: minutesAgo(48),
      isLiveFeed: false,
    },
    {
      id: 'wire-policy-maritime-04',
      title: 'Maritime Trade Corridors Adopt Automated Customs Manifests Across Major Ports',
      summary:
        'Port authorities in Rotterdam, Singapore, and Savannah initiated shared digital bill-of-lading verification to shorten container inspection turnaround times.',
      sourceName: 'NPR National & World',
      sourceUrl: 'https://www.npr.org/sections/world/',
      topic: 'Policy',
      country: 'United States',
      language: 'English',
      publishedAt: minutesAgo(75),
      isLiveFeed: false,
    },
    {
      id: 'wire-science-atmos-05',
      title: 'Polar Atmospheric Buoy Network Expands Real-Time Methane Flux Telemetry',
      summary:
        'A coalition of oceanography institutes deployed 24 autonomous coastal sensors to track seasonal methane plumes across sub-Arctic shelf waters.',
      sourceName: 'NASA Breaking Science',
      sourceUrl: 'https://www.nasa.gov/news/',
      topic: 'Science',
      country: 'United States',
      language: 'English',
      publishedAt: minutesAgo(110),
      isLiveFeed: false,
    },
    {
      id: 'wire-world-es-06',
      title: 'Acuerdo regional impulsa redes de alerta temprana ante sequías prolongadas',
      summary:
        'Ministerios de agricultura y agencias meteorológicas coordinan satélites compartidos para emitir boletines semanales en zonas rurales vulnerables.',
      sourceName: 'BBC Mundo',
      sourceUrl: 'https://www.bbc.com/mundo',
      topic: 'Climate',
      country: 'Global',
      language: 'Spanish',
      publishedAt: minutesAgo(135),
      isLiveFeed: false,
    },
    {
      id: 'wire-world-fr-07',
      title: 'Bruxelles présente un cadre commun pour la résilience des câbles sous-marins',
      summary:
        'La Commission propose des patrouilles maritimes conjointes et des fonds de maintenance rapide pour sécuriser les liaisons de données stratégiques.',
      sourceName: 'France 24',
      sourceUrl: 'https://www.france24.com/fr/',
      topic: 'Policy',
      country: 'European Union',
      language: 'French',
      publishedAt: minutesAgo(160),
      isLiveFeed: false,
    },
    {
      id: 'wire-policy-de-08',
      title: 'Bundesnetzagentur veröffentlicht Ausbauplan für regionale Speicherwerke',
      summary:
        'Neue Genehmigungsverfahren sollen Batteriespeicher neben bestehenden Umspannwerken beschleunigen und Netzengpässe im Winter abbauen.',
      sourceName: 'DW Nachrichten',
      sourceUrl: 'https://www.dw.com/de/themen/s-9077',
      topic: 'Policy',
      country: 'European Union',
      language: 'German',
      publishedAt: minutesAgo(195),
      isLiveFeed: false,
    },
    {
      id: 'wire-world-jp-09',
      title: '次世代送電網と蓄電池の実証事業、主要都市圏で運用開始',
      summary:
        '再生可能エネルギーの変動吸収を目的に、複数地域の配電網を統合制御する新システムが稼働しました。',
      sourceName: 'NHK World Japan',
      sourceUrl: 'https://www3.nhk.or.jp/news/',
      topic: 'Technology',
      country: 'Japan',
      language: 'Japanese',
      publishedAt: minutesAgo(220),
      isLiveFeed: false,
    },
    {
      id: 'wire-world-me-10',
      title: 'Red Sea Desalination Consortium Announces Solar-Thermal Expansion Targets',
      summary:
        'Municipal water utilities signed engineering contracts to power coastal desalination plants with concentrated solar thermal arrays.',
      sourceName: 'Al Jazeera English',
      sourceUrl: 'https://www.aljazeera.com/news/',
      topic: 'World',
      country: 'Middle East',
      language: 'English',
      publishedAt: minutesAgo(260),
      isLiveFeed: false,
    },
  ];
}
