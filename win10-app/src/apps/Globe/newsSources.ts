/* ── News Sources Data ──
   Visual identity + metadata for major global news outlets.
   Used by the news globe to plot sources geographically and color-code by brand. */

export type SourceCategory = 'wire' | 'broadcast' | 'print' | 'digital' | 'state';

export interface NewsSource {
  id: string;            // lowercase slug
  name: string;          // display name
  color: string;         // brand hex color
  category: SourceCategory;
  country: string;       // ISO 3166-1 alpha-2
  reliability: 1 | 2 | 3; // 1 = most reliable, 3 = less reliable
  url: string;
}

const NEWS_SOURCES: NewsSource[] = [

  /* ═══════════════════════════════════════════
     WIRE SERVICES
     ═══════════════════════════════════════════ */
  {
    id: 'reuters',
    name: 'Reuters',
    color: '#FF8000',
    category: 'wire',
    country: 'GB',
    reliability: 1,
    url: 'https://www.reuters.com',
  },
  {
    id: 'ap',
    name: 'Associated Press',
    color: '#EF3E42',
    category: 'wire',
    country: 'US',
    reliability: 1,
    url: 'https://apnews.com',
  },
  {
    id: 'afp',
    name: 'Agence France-Presse',
    color: '#0055A4',
    category: 'wire',
    country: 'FR',
    reliability: 1,
    url: 'https://www.afp.com',
  },
  {
    id: 'upi',
    name: 'United Press International',
    color: '#D32F2F',
    category: 'wire',
    country: 'US',
    reliability: 2,
    url: 'https://www.upi.com',
  },

  /* ═══════════════════════════════════════════
     UNITED STATES
     ═══════════════════════════════════════════ */
  {
    id: 'cnn',
    name: 'CNN',
    color: '#CC0000',
    category: 'broadcast',
    country: 'US',
    reliability: 2,
    url: 'https://www.cnn.com',
  },
  {
    id: 'fox-news',
    name: 'Fox News',
    color: '#003366',
    category: 'broadcast',
    country: 'US',
    reliability: 2,
    url: 'https://www.foxnews.com',
  },
  {
    id: 'msnbc',
    name: 'MSNBC',
    color: '#0089CF',
    category: 'broadcast',
    country: 'US',
    reliability: 2,
    url: 'https://www.msnbc.com',
  },
  {
    id: 'nbc-news',
    name: 'NBC News',
    color: '#E5A836',
    category: 'broadcast',
    country: 'US',
    reliability: 1,
    url: 'https://www.nbcnews.com',
  },
  {
    id: 'abc-news',
    name: 'ABC News',
    color: '#1A1A1A',
    category: 'broadcast',
    country: 'US',
    reliability: 1,
    url: 'https://abcnews.go.com',
  },
  {
    id: 'cbs-news',
    name: 'CBS News',
    color: '#1A56DB',
    category: 'broadcast',
    country: 'US',
    reliability: 1,
    url: 'https://www.cbsnews.com',
  },
  {
    id: 'npr',
    name: 'NPR',
    color: '#1A1A1A',
    category: 'broadcast',
    country: 'US',
    reliability: 1,
    url: 'https://www.npr.org',
  },
  {
    id: 'nyt',
    name: 'The New York Times',
    color: '#1A1A1A',
    category: 'print',
    country: 'US',
    reliability: 1,
    url: 'https://www.nytimes.com',
  },
  {
    id: 'wapo',
    name: 'The Washington Post',
    color: '#1A1A1A',
    category: 'print',
    country: 'US',
    reliability: 1,
    url: 'https://www.washingtonpost.com',
  },
  {
    id: 'wsj',
    name: 'The Wall Street Journal',
    color: '#1A1A1A',
    category: 'print',
    country: 'US',
    reliability: 1,
    url: 'https://www.wsj.com',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    color: '#472A91',
    category: 'digital',
    country: 'US',
    reliability: 1,
    url: 'https://www.bloomberg.com',
  },
  {
    id: 'politico',
    name: 'Politico',
    color: '#BE1508',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://www.politico.com',
  },
  {
    id: 'the-hill',
    name: 'The Hill',
    color: '#00609C',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://thehill.com',
  },
  {
    id: 'usa-today',
    name: 'USA Today',
    color: '#009BFF',
    category: 'print',
    country: 'US',
    reliability: 2,
    url: 'https://www.usatoday.com',
  },

  /* ═══════════════════════════════════════════
     UNITED KINGDOM
     ═══════════════════════════════════════════ */
  {
    id: 'bbc',
    name: 'BBC News',
    color: '#BB1919',
    category: 'broadcast',
    country: 'GB',
    reliability: 1,
    url: 'https://www.bbc.com/news',
  },
  {
    id: 'sky-news',
    name: 'Sky News',
    color: '#C80815',
    category: 'broadcast',
    country: 'GB',
    reliability: 1,
    url: 'https://news.sky.com',
  },
  {
    id: 'the-guardian',
    name: 'The Guardian',
    color: '#052962',
    category: 'print',
    country: 'GB',
    reliability: 1,
    url: 'https://www.theguardian.com',
  },
  {
    id: 'the-telegraph',
    name: 'The Telegraph',
    color: '#1D8649',
    category: 'print',
    country: 'GB',
    reliability: 2,
    url: 'https://www.telegraph.co.uk',
  },
  {
    id: 'financial-times',
    name: 'Financial Times',
    color: '#FFF1E5',
    category: 'print',
    country: 'GB',
    reliability: 1,
    url: 'https://www.ft.com',
  },
  {
    id: 'the-independent',
    name: 'The Independent',
    color: '#EC1A2E',
    category: 'digital',
    country: 'GB',
    reliability: 2,
    url: 'https://www.independent.co.uk',
  },

  /* ═══════════════════════════════════════════
     EUROPE
     ═══════════════════════════════════════════ */
  {
    id: 'dw',
    name: 'Deutsche Welle',
    color: '#0078D7',
    category: 'broadcast',
    country: 'DE',
    reliability: 1,
    url: 'https://www.dw.com',
  },
  {
    id: 'france24',
    name: 'France 24',
    color: '#00A7E1',
    category: 'broadcast',
    country: 'FR',
    reliability: 1,
    url: 'https://www.france24.com',
  },
  {
    id: 'euronews',
    name: 'Euronews',
    color: '#003C71',
    category: 'broadcast',
    country: 'FR',
    reliability: 2,
    url: 'https://www.euronews.com',
  },
  {
    id: 'el-pais',
    name: 'El País',
    color: '#1A1A1A',
    category: 'print',
    country: 'ES',
    reliability: 1,
    url: 'https://elpais.com',
  },
  {
    id: 'der-spiegel',
    name: 'Der Spiegel',
    color: '#E64415',
    category: 'print',
    country: 'DE',
    reliability: 1,
    url: 'https://www.spiegel.de',
  },
  {
    id: 'le-monde',
    name: 'Le Monde',
    color: '#1A1A1A',
    category: 'print',
    country: 'FR',
    reliability: 1,
    url: 'https://www.lemonde.fr',
  },
  {
    id: 'ansa',
    name: 'ANSA',
    color: '#005EB8',
    category: 'wire',
    country: 'IT',
    reliability: 1,
    url: 'https://www.ansa.it',
  },

  /* ═══════════════════════════════════════════
     MIDDLE EAST
     ═══════════════════════════════════════════ */
  {
    id: 'al-jazeera',
    name: 'Al Jazeera',
    color: '#D2A44E',
    category: 'broadcast',
    country: 'QA',
    reliability: 2,
    url: 'https://www.aljazeera.com',
  },
  {
    id: 'al-arabiya',
    name: 'Al Arabiya',
    color: '#FF6600',
    category: 'broadcast',
    country: 'SA',
    reliability: 2,
    url: 'https://english.alarabiya.net',
  },
  {
    id: 'times-of-israel',
    name: 'Times of Israel',
    color: '#0A3F7F',
    category: 'digital',
    country: 'IL',
    reliability: 2,
    url: 'https://www.timesofisrael.com',
  },
  {
    id: 'haaretz',
    name: 'Haaretz',
    color: '#0B7837',
    category: 'print',
    country: 'IL',
    reliability: 1,
    url: 'https://www.haaretz.com',
  },

  /* ═══════════════════════════════════════════
     ASIA-PACIFIC
     ═══════════════════════════════════════════ */
  {
    id: 'nhk',
    name: 'NHK World',
    color: '#0050A0',
    category: 'broadcast',
    country: 'JP',
    reliability: 1,
    url: 'https://www3.nhk.or.jp/nhkworld',
  },
  {
    id: 'scmp',
    name: 'South China Morning Post',
    color: '#FFCC00',
    category: 'print',
    country: 'HK',
    reliability: 2,
    url: 'https://www.scmp.com',
  },
  {
    id: 'times-of-india',
    name: 'Times of India',
    color: '#E21B22',
    category: 'print',
    country: 'IN',
    reliability: 2,
    url: 'https://timesofindia.indiatimes.com',
  },
  {
    id: 'straits-times',
    name: 'The Straits Times',
    color: '#1B3C71',
    category: 'print',
    country: 'SG',
    reliability: 1,
    url: 'https://www.straitstimes.com',
  },
  {
    id: 'nikkei',
    name: 'Nikkei Asia',
    color: '#00A3E0',
    category: 'print',
    country: 'JP',
    reliability: 1,
    url: 'https://asia.nikkei.com',
  },
  {
    id: 'yonhap',
    name: 'Yonhap News',
    color: '#003478',
    category: 'wire',
    country: 'KR',
    reliability: 1,
    url: 'https://en.yna.co.kr',
  },
  {
    id: 'xinhua',
    name: 'Xinhua',
    color: '#DE2910',
    category: 'state',
    country: 'CN',
    reliability: 3,
    url: 'https://english.news.cn',
  },

  /* ═══════════════════════════════════════════
     LATIN AMERICA
     ═══════════════════════════════════════════ */
  {
    id: 'globo',
    name: 'Globo',
    color: '#EE1D23',
    category: 'broadcast',
    country: 'BR',
    reliability: 2,
    url: 'https://g1.globo.com',
  },
  {
    id: 'telam',
    name: 'Télam',
    color: '#00AEEF',
    category: 'wire',
    country: 'AR',
    reliability: 2,
    url: 'https://www.telam.com.ar',
  },

  /* ═══════════════════════════════════════════
     AFRICA
     ═══════════════════════════════════════════ */
  {
    id: 'news24',
    name: 'News24',
    color: '#ED1C24',
    category: 'digital',
    country: 'ZA',
    reliability: 2,
    url: 'https://www.news24.com',
  },
  {
    id: 'daily-nation',
    name: 'Daily Nation',
    color: '#003580',
    category: 'print',
    country: 'KE',
    reliability: 2,
    url: 'https://nation.africa',
  },

  /* ═══════════════════════════════════════════
     TECH
     ═══════════════════════════════════════════ */
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    color: '#0A9B2C',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://techcrunch.com',
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    color: '#E8503A',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://www.theverge.com',
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    color: '#FF4E00',
    category: 'digital',
    country: 'US',
    reliability: 1,
    url: 'https://arstechnica.com',
  },
  {
    id: 'wired',
    name: 'Wired',
    color: '#1A1A1A',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://www.wired.com',
  },

  /* ═══════════════════════════════════════════
     BUSINESS / FINANCE
     ═══════════════════════════════════════════ */
  {
    id: 'cnbc',
    name: 'CNBC',
    color: '#005594',
    category: 'broadcast',
    country: 'US',
    reliability: 1,
    url: 'https://www.cnbc.com',
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    color: '#4CAF50',
    category: 'digital',
    country: 'US',
    reliability: 2,
    url: 'https://www.marketwatch.com',
  },
  {
    id: 'forbes',
    name: 'Forbes',
    color: '#1A1A1A',
    category: 'print',
    country: 'US',
    reliability: 2,
    url: 'https://www.forbes.com',
  },
];

export default NEWS_SOURCES;

/* ── Lookup helpers ── */

/** Get a single source by its slug id */
export function getSourceById(id: string): NewsSource | undefined {
  return NEWS_SOURCES.find(s => s.id === id);
}

/** Filter sources by category */
export function getSourcesByCategory(category: SourceCategory): NewsSource[] {
  return NEWS_SOURCES.filter(s => s.category === category);
}

/** Filter sources by country code */
export function getSourcesByCountry(country: string): NewsSource[] {
  return NEWS_SOURCES.filter(s => s.country === country);
}

/** Filter sources by reliability tier */
export function getSourcesByReliability(tier: 1 | 2 | 3): NewsSource[] {
  return NEWS_SOURCES.filter(s => s.reliability === tier);
}

/** All unique country codes present in the dataset */
export function getCountryCodes(): string[] {
  return [...new Set(NEWS_SOURCES.map(s => s.country))];
}

/** Category color for legend / grouping UI */
export const CATEGORY_COLORS: Record<SourceCategory, string> = {
  wire:      '#FF8C00',
  broadcast: '#2196F3',
  print:     '#4CAF50',
  digital:   '#9C27B0',
  state:     '#F44336',
};
