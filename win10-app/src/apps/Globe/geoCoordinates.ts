/* ─────────────────────────────────────────────────────────────────────────────
 * geoCoordinates.ts — ISO 3166-1 alpha-2 country-code → capital coordinates,
 * major world cities, region centroids, and helper look-ups for pinning news
 * articles to locations on the Globe.
 * ───────────────────────────────────────────────────────────────────────────── */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NamedLocation extends LatLng {
  name: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * 1. COUNTRY CAPITALS — keyed by ISO 3166-1 alpha-2 code
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const COUNTRY_CAPITALS: Record<string, NamedLocation> = {
  // ── A ──
  AF: { name: 'Kabul',               lat: 34.5553,  lng:  69.2075 },
  AL: { name: 'Tirana',              lat: 41.3275,  lng:  19.8187 },
  DZ: { name: 'Algiers',             lat: 36.7538,  lng:   3.0588 },
  AD: { name: 'Andorra la Vella',    lat: 42.5063,  lng:   1.5218 },
  AO: { name: 'Luanda',              lat: -8.8390,  lng:  13.2894 },
  AG: { name: 'St. John\'s',         lat: 17.1274,  lng: -61.8468 },
  AR: { name: 'Buenos Aires',        lat:-34.6037,  lng: -58.3816 },
  AM: { name: 'Yerevan',             lat: 40.1792,  lng:  44.4991 },
  AU: { name: 'Canberra',            lat:-35.2809,  lng: 149.1300 },
  AT: { name: 'Vienna',              lat: 48.2082,  lng:  16.3738 },
  AZ: { name: 'Baku',                lat: 40.4093,  lng:  49.8671 },

  // ── B ──
  BS: { name: 'Nassau',              lat: 25.0480,  lng: -77.3554 },
  BH: { name: 'Manama',              lat: 26.2285,  lng:  50.5860 },
  BD: { name: 'Dhaka',               lat: 23.8103,  lng:  90.4125 },
  BB: { name: 'Bridgetown',          lat: 13.1132,  lng: -59.5988 },
  BY: { name: 'Minsk',               lat: 53.9006,  lng:  27.5590 },
  BE: { name: 'Brussels',            lat: 50.8503,  lng:   4.3517 },
  BZ: { name: 'Belmopan',            lat: 17.2510,  lng: -88.7590 },
  BJ: { name: 'Porto-Novo',          lat:  6.4969,  lng:   2.6289 },
  BT: { name: 'Thimphu',             lat: 27.4728,  lng:  89.6393 },
  BO: { name: 'Sucre',               lat:-19.0196,  lng: -65.2619 },
  BA: { name: 'Sarajevo',            lat: 43.8563,  lng:  18.4131 },
  BW: { name: 'Gaborone',            lat:-24.6282,  lng:  25.9231 },
  BR: { name: 'Brasília',            lat:-15.8267,  lng: -47.9218 },
  BN: { name: 'Bandar Seri Begawan', lat:  4.9031,  lng: 114.9398 },
  BG: { name: 'Sofia',               lat: 42.6977,  lng:  23.3219 },
  BF: { name: 'Ouagadougou',         lat: 12.3714,  lng:  -1.5197 },
  BI: { name: 'Gitega',              lat: -3.4264,  lng:  29.9246 },

  // ── C ──
  CV: { name: 'Praia',               lat: 14.9331,  lng: -23.5133 },
  KH: { name: 'Phnom Penh',          lat: 11.5564,  lng: 104.9282 },
  CM: { name: 'Yaoundé',             lat:  3.8480,  lng:  11.5021 },
  CA: { name: 'Ottawa',              lat: 45.4215,  lng: -75.6972 },
  CF: { name: 'Bangui',              lat:  4.3947,  lng:  18.5582 },
  TD: { name: 'N\'Djamena',          lat: 12.1348,  lng:  15.0557 },
  CL: { name: 'Santiago',            lat:-33.4489,  lng: -70.6693 },
  CN: { name: 'Beijing',             lat: 39.9042,  lng: 116.4074 },
  CO: { name: 'Bogotá',              lat:  4.7110,  lng: -74.0721 },
  KM: { name: 'Moroni',              lat:-11.7172,  lng:  43.2551 },
  CG: { name: 'Brazzaville',         lat: -4.2634,  lng:  15.2429 },
  CD: { name: 'Kinshasa',            lat: -4.4419,  lng:  15.2663 },
  CR: { name: 'San José',            lat:  9.9281,  lng: -84.0907 },
  CI: { name: 'Yamoussoukro',        lat:  6.8276,  lng:  -5.2893 },
  HR: { name: 'Zagreb',              lat: 45.8150,  lng:  15.9819 },
  CU: { name: 'Havana',              lat: 23.1136,  lng: -82.3666 },
  CY: { name: 'Nicosia',             lat: 35.1856,  lng:  33.3823 },
  CZ: { name: 'Prague',              lat: 50.0755,  lng:  14.4378 },

  // ── D ──
  DK: { name: 'Copenhagen',          lat: 55.6761,  lng:  12.5683 },
  DJ: { name: 'Djibouti',            lat: 11.5880,  lng:  43.1456 },
  DM: { name: 'Roseau',              lat: 15.3010,  lng: -61.3870 },
  DO: { name: 'Santo Domingo',       lat: 18.4861,  lng: -69.9312 },

  // ── E ──
  EC: { name: 'Quito',               lat: -0.1807,  lng: -78.4678 },
  EG: { name: 'Cairo',               lat: 30.0444,  lng:  31.2357 },
  SV: { name: 'San Salvador',        lat: 13.6929,  lng: -89.2182 },
  GQ: { name: 'Malabo',              lat:  3.7504,  lng:   8.7371 },
  ER: { name: 'Asmara',              lat: 15.3229,  lng:  38.9251 },
  EE: { name: 'Tallinn',             lat: 59.4370,  lng:  24.7536 },
  SZ: { name: 'Mbabane',             lat:-26.3054,  lng:  31.1367 },
  ET: { name: 'Addis Ababa',         lat:  9.0250,  lng:  38.7469 },

  // ── F ──
  FJ: { name: 'Suva',                lat:-18.1416,  lng: 178.4419 },
  FI: { name: 'Helsinki',            lat: 60.1699,  lng:  24.9384 },
  FR: { name: 'Paris',               lat: 48.8566,  lng:   2.3522 },

  // ── G ──
  GA: { name: 'Libreville',          lat:  0.4162,  lng:   9.4673 },
  GM: { name: 'Banjul',              lat: 13.4549,  lng: -16.5790 },
  GE: { name: 'Tbilisi',             lat: 41.7151,  lng:  44.8271 },
  DE: { name: 'Berlin',              lat: 52.5200,  lng:  13.4050 },
  GH: { name: 'Accra',               lat:  5.6037,  lng:  -0.1870 },
  GR: { name: 'Athens',              lat: 37.9838,  lng:  23.7275 },
  GD: { name: 'St. George\'s',       lat: 12.0564,  lng: -61.7485 },
  GT: { name: 'Guatemala City',      lat: 14.6349,  lng: -90.5069 },
  GN: { name: 'Conakry',             lat:  9.6412,  lng: -13.5784 },
  GW: { name: 'Bissau',              lat: 11.8037,  lng: -15.1804 },
  GY: { name: 'Georgetown',          lat:  6.8013,  lng: -58.1551 },

  // ── H ──
  HT: { name: 'Port-au-Prince',      lat: 18.5944,  lng: -72.3074 },
  HN: { name: 'Tegucigalpa',         lat: 14.0723,  lng: -87.1921 },
  HU: { name: 'Budapest',            lat: 47.4979,  lng:  19.0402 },

  // ── I ──
  IS: { name: 'Reykjavík',           lat: 64.1466,  lng: -21.9426 },
  IN: { name: 'New Delhi',           lat: 28.6139,  lng:  77.2090 },
  ID: { name: 'Jakarta',             lat: -6.2088,  lng: 106.8456 },
  IR: { name: 'Tehran',              lat: 35.6892,  lng:  51.3890 },
  IQ: { name: 'Baghdad',             lat: 33.3152,  lng:  44.3661 },
  IE: { name: 'Dublin',              lat: 53.3498,  lng:  -6.2603 },
  IL: { name: 'Jerusalem',           lat: 31.7683,  lng:  35.2137 },
  IT: { name: 'Rome',                lat: 41.9028,  lng:  12.4964 },

  // ── J ──
  JM: { name: 'Kingston',            lat: 18.0179,  lng: -76.8099 },
  JP: { name: 'Tokyo',               lat: 35.6762,  lng: 139.6503 },
  JO: { name: 'Amman',               lat: 31.9454,  lng:  35.9284 },

  // ── K ──
  KZ: { name: 'Astana',              lat: 51.1694,  lng:  71.4491 },
  KE: { name: 'Nairobi',             lat: -1.2921,  lng:  36.8219 },
  KI: { name: 'Tarawa',              lat:  1.4518,  lng: 172.9717 },
  KP: { name: 'Pyongyang',           lat: 39.0392,  lng: 125.7625 },
  KR: { name: 'Seoul',               lat: 37.5665,  lng: 126.9780 },
  KW: { name: 'Kuwait City',         lat: 29.3759,  lng:  47.9774 },
  KG: { name: 'Bishkek',             lat: 42.8746,  lng:  74.5698 },

  // ── L ──
  LA: { name: 'Vientiane',           lat: 17.9757,  lng: 102.6331 },
  LV: { name: 'Riga',                lat: 56.9496,  lng:  24.1052 },
  LB: { name: 'Beirut',              lat: 33.8938,  lng:  35.5018 },
  LS: { name: 'Maseru',              lat:-29.3167,  lng:  27.4833 },
  LR: { name: 'Monrovia',            lat:  6.2907,  lng: -10.7605 },
  LY: { name: 'Tripoli',             lat: 32.8872,  lng:  13.1913 },
  LI: { name: 'Vaduz',               lat: 47.1410,  lng:   9.5209 },
  LT: { name: 'Vilnius',             lat: 54.6872,  lng:  25.2797 },
  LU: { name: 'Luxembourg',          lat: 49.6117,  lng:   6.1300 },

  // ── M ──
  MG: { name: 'Antananarivo',        lat:-18.8792,  lng:  47.5079 },
  MW: { name: 'Lilongwe',            lat:-13.9626,  lng:  33.7741 },
  MY: { name: 'Kuala Lumpur',        lat:  3.1390,  lng: 101.6869 },
  MV: { name: 'Malé',                lat:  4.1755,  lng:  73.5093 },
  ML: { name: 'Bamako',              lat: 12.6392,  lng:  -8.0029 },
  MT: { name: 'Valletta',            lat: 35.8989,  lng:  14.5146 },
  MH: { name: 'Majuro',              lat:  7.1164,  lng: 171.1858 },
  MR: { name: 'Nouakchott',          lat: 18.0735,  lng: -15.9582 },
  MU: { name: 'Port Louis',          lat:-20.1609,  lng:  57.5012 },
  MX: { name: 'Mexico City',         lat: 19.4326,  lng: -99.1332 },
  FM: { name: 'Palikir',             lat:  6.9147,  lng: 158.1610 },
  MD: { name: 'Chișinău',            lat: 47.0105,  lng:  28.8638 },
  MC: { name: 'Monaco',              lat: 43.7384,  lng:   7.4246 },
  MN: { name: 'Ulaanbaatar',         lat: 47.8864,  lng: 106.9057 },
  ME: { name: 'Podgorica',           lat: 42.4304,  lng:  19.2594 },
  MA: { name: 'Rabat',               lat: 34.0209,  lng:  -6.8416 },
  MZ: { name: 'Maputo',              lat:-25.9692,  lng:  32.5732 },
  MM: { name: 'Naypyidaw',           lat: 19.7633,  lng:  96.0785 },

  // ── N ──
  NA: { name: 'Windhoek',            lat:-22.5609,  lng:  17.0658 },
  NR: { name: 'Yaren',               lat: -0.5477,  lng: 166.9209 },
  NP: { name: 'Kathmandu',           lat: 27.7172,  lng:  85.3240 },
  NL: { name: 'Amsterdam',           lat: 52.3676,  lng:   4.9041 },
  NZ: { name: 'Wellington',          lat:-41.2865,  lng: 174.7762 },
  NI: { name: 'Managua',             lat: 12.1150,  lng: -86.2362 },
  NE: { name: 'Niamey',              lat: 13.5137,  lng:   2.1098 },
  NG: { name: 'Abuja',               lat:  9.0579,  lng:   7.4951 },
  MK: { name: 'Skopje',              lat: 41.9973,  lng:  21.4280 },
  NO: { name: 'Oslo',                lat: 59.9139,  lng:  10.7522 },

  // ── O ──
  OM: { name: 'Muscat',              lat: 23.5880,  lng:  58.3829 },

  // ── P ──
  PK: { name: 'Islamabad',           lat: 33.6844,  lng:  73.0479 },
  PW: { name: 'Ngerulmud',           lat:  7.5006,  lng: 134.6242 },
  PA: { name: 'Panama City',         lat:  8.9824,  lng: -79.5199 },
  PG: { name: 'Port Moresby',        lat: -6.3149,  lng: 143.9556 },
  PY: { name: 'Asunción',            lat:-25.2637,  lng: -57.5759 },
  PE: { name: 'Lima',                lat:-12.0464,  lng: -77.0428 },
  PH: { name: 'Manila',              lat: 14.5995,  lng: 120.9842 },
  PL: { name: 'Warsaw',              lat: 52.2297,  lng:  21.0122 },
  PT: { name: 'Lisbon',              lat: 38.7223,  lng:  -9.1393 },

  // ── Q ──
  QA: { name: 'Doha',                lat: 25.2854,  lng:  51.5310 },

  // ── R ──
  RO: { name: 'Bucharest',           lat: 44.4268,  lng:  26.1025 },
  RU: { name: 'Moscow',              lat: 55.7558,  lng:  37.6173 },
  RW: { name: 'Kigali',              lat: -1.9403,  lng:  29.8739 },

  // ── S ──
  KN: { name: 'Basseterre',          lat: 17.3026,  lng: -62.7177 },
  LC: { name: 'Castries',            lat: 14.0101,  lng: -60.9875 },
  VC: { name: 'Kingstown',           lat: 13.1587,  lng: -61.2248 },
  WS: { name: 'Apia',                lat:-13.8333,  lng:-171.7500 },
  SM: { name: 'San Marino',          lat: 43.9424,  lng:  12.4578 },
  ST: { name: 'São Tomé',            lat:  0.1864,  lng:   6.6131 },
  SA: { name: 'Riyadh',              lat: 24.7136,  lng:  46.6753 },
  SN: { name: 'Dakar',               lat: 14.7167,  lng: -17.4677 },
  RS: { name: 'Belgrade',            lat: 44.7866,  lng:  20.4489 },
  SC: { name: 'Victoria',            lat: -4.6191,  lng:  55.4513 },
  SL: { name: 'Freetown',            lat:  8.4840,  lng: -13.2299 },
  SG: { name: 'Singapore',           lat:  1.3521,  lng: 103.8198 },
  SK: { name: 'Bratislava',          lat: 48.1486,  lng:  17.1077 },
  SI: { name: 'Ljubljana',           lat: 46.0569,  lng:  14.5058 },
  SB: { name: 'Honiara',             lat: -9.4456,  lng: 159.9729 },
  SO: { name: 'Mogadishu',           lat:  2.0469,  lng:  45.3182 },
  ZA: { name: 'Pretoria',            lat:-25.7479,  lng:  28.2293 },
  SS: { name: 'Juba',                lat:  4.8594,  lng:  31.5713 },
  ES: { name: 'Madrid',              lat: 40.4168,  lng:  -3.7038 },
  LK: { name: 'Colombo',             lat:  6.9271,  lng:  79.8612 },
  SD: { name: 'Khartoum',            lat: 15.5007,  lng:  32.5599 },
  SR: { name: 'Paramaribo',          lat:  5.8520,  lng: -55.2038 },
  SE: { name: 'Stockholm',           lat: 59.3293,  lng:  18.0686 },
  CH: { name: 'Bern',                lat: 46.9480,  lng:   7.4474 },
  SY: { name: 'Damascus',            lat: 33.5138,  lng:  36.2765 },

  // ── T ──
  TW: { name: 'Taipei',              lat: 25.0330,  lng: 121.5654 },
  TJ: { name: 'Dushanbe',            lat: 38.5598,  lng:  68.7740 },
  TZ: { name: 'Dodoma',              lat: -6.1630,  lng:  35.7516 },
  TH: { name: 'Bangkok',             lat: 13.7563,  lng: 100.5018 },
  TL: { name: 'Dili',                lat: -8.5569,  lng: 125.5603 },
  TG: { name: 'Lomé',                lat:  6.1256,  lng:   1.2254 },
  TO: { name: 'Nuku\'alofa',         lat:-21.2087,  lng:-175.1982 },
  TT: { name: 'Port of Spain',       lat: 10.6596,  lng: -61.5086 },
  TN: { name: 'Tunis',               lat: 36.8065,  lng:  10.1815 },
  TR: { name: 'Ankara',              lat: 39.9334,  lng:  32.8597 },
  TM: { name: 'Ashgabat',            lat: 37.9601,  lng:  58.3261 },
  TV: { name: 'Funafuti',            lat: -8.5211,  lng: 179.1962 },

  // ── U ──
  UG: { name: 'Kampala',             lat:  0.3476,  lng:  32.5825 },
  UA: { name: 'Kyiv',                lat: 50.4501,  lng:  30.5234 },
  AE: { name: 'Abu Dhabi',           lat: 24.4539,  lng:  54.3773 },
  GB: { name: 'London',              lat: 51.5074,  lng:  -0.1278 },
  US: { name: 'Washington, D.C.',    lat: 38.9072,  lng: -77.0369 },
  UY: { name: 'Montevideo',          lat:-34.9011,  lng: -56.1645 },
  UZ: { name: 'Tashkent',            lat: 41.2995,  lng:  69.2401 },

  // ── V ──
  VU: { name: 'Port Vila',           lat:-17.7334,  lng: 168.3273 },
  VA: { name: 'Vatican City',        lat: 41.9029,  lng:  12.4534 },
  VE: { name: 'Caracas',             lat: 10.4806,  lng: -66.9036 },
  VN: { name: 'Hanoi',               lat: 21.0278,  lng: 105.8342 },

  // ── Y ──
  YE: { name: 'Sana\'a',             lat: 15.3694,  lng:  44.1910 },

  // ── Z ──
  ZM: { name: 'Lusaka',              lat:-15.3875,  lng:  28.3228 },
  ZW: { name: 'Harare',              lat:-17.8252,  lng:  31.0335 },

  // ── Territories & special codes often seen in news ──
  PS: { name: 'Ramallah',            lat: 31.9038,  lng:  35.2034 },
  XK: { name: 'Pristina',            lat: 42.6629,  lng:  21.1655 },
  HK: { name: 'Hong Kong',           lat: 22.3193,  lng: 114.1694 },
  MO: { name: 'Macau',               lat: 22.1987,  lng: 113.5439 },
  PR: { name: 'San Juan',            lat: 18.4655,  lng: -66.1057 },
};


/* ═══════════════════════════════════════════════════════════════════════════════
 * 2. MAJOR CITIES — top ~120 world cities by global prominence / news frequency
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const MAJOR_CITIES: Record<string, LatLng> = {
  // ── North America ──
  'New York':       { lat: 40.7128,  lng: -74.0060 },
  'Los Angeles':    { lat: 34.0522,  lng:-118.2437 },
  'Chicago':        { lat: 41.8781,  lng: -87.6298 },
  'Houston':        { lat: 29.7604,  lng: -95.3698 },
  'Phoenix':        { lat: 33.4484,  lng:-112.0740 },
  'San Francisco':  { lat: 37.7749,  lng:-122.4194 },
  'Seattle':        { lat: 47.6062,  lng:-122.3321 },
  'Miami':          { lat: 25.7617,  lng: -80.1918 },
  'Atlanta':        { lat: 33.7490,  lng: -84.3880 },
  'Boston':         { lat: 42.3601,  lng: -71.0589 },
  'Denver':         { lat: 39.7392,  lng:-104.9903 },
  'Dallas':         { lat: 32.7767,  lng: -96.7970 },
  'Washington':     { lat: 38.9072,  lng: -77.0369 },
  'Toronto':        { lat: 43.6532,  lng: -79.3832 },
  'Vancouver':      { lat: 49.2827,  lng:-123.1207 },
  'Montreal':       { lat: 45.5017,  lng: -73.5673 },
  'Mexico City':    { lat: 19.4326,  lng: -99.1332 },

  // ── Central / South America ──
  'São Paulo':      { lat:-23.5505,  lng: -46.6333 },
  'Rio de Janeiro': { lat:-22.9068,  lng: -43.1729 },
  'Buenos Aires':   { lat:-34.6037,  lng: -58.3816 },
  'Bogotá':         { lat:  4.7110,  lng: -74.0721 },
  'Lima':           { lat:-12.0464,  lng: -77.0428 },
  'Santiago':       { lat:-33.4489,  lng: -70.6693 },
  'Havana':         { lat: 23.1136,  lng: -82.3666 },
  'Caracas':        { lat: 10.4806,  lng: -66.9036 },

  // ── Europe ──
  'London':         { lat: 51.5074,  lng:  -0.1278 },
  'Paris':          { lat: 48.8566,  lng:   2.3522 },
  'Berlin':         { lat: 52.5200,  lng:  13.4050 },
  'Madrid':         { lat: 40.4168,  lng:  -3.7038 },
  'Rome':           { lat: 41.9028,  lng:  12.4964 },
  'Amsterdam':      { lat: 52.3676,  lng:   4.9041 },
  'Brussels':       { lat: 50.8503,  lng:   4.3517 },
  'Vienna':         { lat: 48.2082,  lng:  16.3738 },
  'Zurich':         { lat: 47.3769,  lng:   8.5417 },
  'Geneva':         { lat: 46.2044,  lng:   6.1432 },
  'Munich':         { lat: 48.1351,  lng:  11.5820 },
  'Frankfurt':      { lat: 50.1109,  lng:   8.6821 },
  'Milan':          { lat: 45.4642,  lng:   9.1900 },
  'Barcelona':      { lat: 41.3874,  lng:   2.1686 },
  'Lisbon':         { lat: 38.7223,  lng:  -9.1393 },
  'Dublin':         { lat: 53.3498,  lng:  -6.2603 },
  'Edinburgh':      { lat: 55.9533,  lng:  -3.1883 },
  'Stockholm':      { lat: 59.3293,  lng:  18.0686 },
  'Oslo':           { lat: 59.9139,  lng:  10.7522 },
  'Copenhagen':     { lat: 55.6761,  lng:  12.5683 },
  'Helsinki':       { lat: 60.1699,  lng:  24.9384 },
  'Warsaw':         { lat: 52.2297,  lng:  21.0122 },
  'Prague':         { lat: 50.0755,  lng:  14.4378 },
  'Budapest':       { lat: 47.4979,  lng:  19.0402 },
  'Bucharest':      { lat: 44.4268,  lng:  26.1025 },
  'Athens':         { lat: 37.9838,  lng:  23.7275 },
  'Istanbul':       { lat: 41.0082,  lng:  28.9784 },
  'Kyiv':           { lat: 50.4501,  lng:  30.5234 },
  'Moscow':         { lat: 55.7558,  lng:  37.6173 },
  'St. Petersburg': { lat: 59.9343,  lng:  30.3351 },

  // ── Middle East ──
  'Dubai':          { lat: 25.2048,  lng:  55.2708 },
  'Abu Dhabi':      { lat: 24.4539,  lng:  54.3773 },
  'Riyadh':         { lat: 24.7136,  lng:  46.6753 },
  'Jeddah':         { lat: 21.4858,  lng:  39.1925 },
  'Tehran':         { lat: 35.6892,  lng:  51.3890 },
  'Baghdad':        { lat: 33.3152,  lng:  44.3661 },
  'Beirut':         { lat: 33.8938,  lng:  35.5018 },
  'Jerusalem':      { lat: 31.7683,  lng:  35.2137 },
  'Tel Aviv':       { lat: 32.0853,  lng:  34.7818 },
  'Doha':           { lat: 25.2854,  lng:  51.5310 },
  'Ankara':         { lat: 39.9334,  lng:  32.8597 },
  'Damascus':       { lat: 33.5138,  lng:  36.2765 },
  'Amman':          { lat: 31.9454,  lng:  35.9284 },

  // ── Africa ──
  'Cairo':          { lat: 30.0444,  lng:  31.2357 },
  'Lagos':          { lat:  6.5244,  lng:   3.3792 },
  'Nairobi':        { lat: -1.2921,  lng:  36.8219 },
  'Johannesburg':   { lat:-26.2041,  lng:  28.0473 },
  'Cape Town':      { lat:-33.9249,  lng:  18.4241 },
  'Casablanca':     { lat: 33.5731,  lng:  -7.5898 },
  'Addis Ababa':    { lat:  9.0250,  lng:  38.7469 },
  'Accra':          { lat:  5.6037,  lng:  -0.1870 },
  'Dar es Salaam':  { lat: -6.7924,  lng:  39.2083 },
  'Khartoum':       { lat: 15.5007,  lng:  32.5599 },
  'Algiers':        { lat: 36.7538,  lng:   3.0588 },
  'Kinshasa':       { lat: -4.4419,  lng:  15.2663 },
  'Luanda':         { lat: -8.8390,  lng:  13.2894 },

  // ── South Asia ──
  'Mumbai':         { lat: 19.0760,  lng:  72.8777 },
  'New Delhi':      { lat: 28.6139,  lng:  77.2090 },
  'Delhi':          { lat: 28.7041,  lng:  77.1025 },
  'Bangalore':      { lat: 12.9716,  lng:  77.5946 },
  'Chennai':        { lat: 13.0827,  lng:  80.2707 },
  'Kolkata':        { lat: 22.5726,  lng:  88.3639 },
  'Karachi':        { lat: 24.8607,  lng:  67.0011 },
  'Islamabad':      { lat: 33.6844,  lng:  73.0479 },
  'Dhaka':          { lat: 23.8103,  lng:  90.4125 },
  'Colombo':        { lat:  6.9271,  lng:  79.8612 },
  'Kathmandu':      { lat: 27.7172,  lng:  85.3240 },

  // ── East / Southeast Asia ──
  'Beijing':        { lat: 39.9042,  lng: 116.4074 },
  'Shanghai':       { lat: 31.2304,  lng: 121.4737 },
  'Shenzhen':       { lat: 22.5431,  lng: 114.0579 },
  'Guangzhou':      { lat: 23.1291,  lng: 113.2644 },
  'Hong Kong':      { lat: 22.3193,  lng: 114.1694 },
  'Taipei':         { lat: 25.0330,  lng: 121.5654 },
  'Tokyo':          { lat: 35.6762,  lng: 139.6503 },
  'Osaka':          { lat: 34.6937,  lng: 135.5023 },
  'Seoul':          { lat: 37.5665,  lng: 126.9780 },
  'Bangkok':        { lat: 13.7563,  lng: 100.5018 },
  'Singapore':      { lat:  1.3521,  lng: 103.8198 },
  'Kuala Lumpur':   { lat:  3.1390,  lng: 101.6869 },
  'Jakarta':        { lat: -6.2088,  lng: 106.8456 },
  'Manila':         { lat: 14.5995,  lng: 120.9842 },
  'Hanoi':          { lat: 21.0278,  lng: 105.8342 },
  'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
  'Phnom Penh':     { lat: 11.5564,  lng: 104.9282 },

  // ── Oceania ──
  'Sydney':         { lat:-33.8688,  lng: 151.2093 },
  'Melbourne':      { lat:-37.8136,  lng: 144.9631 },
  'Auckland':       { lat:-36.8485,  lng: 174.7633 },
  'Perth':          { lat:-31.9505,  lng: 115.8605 },

  // ── Central Asia / Caucasus ──
  'Tashkent':       { lat: 41.2995,  lng:  69.2401 },
  'Astana':         { lat: 51.1694,  lng:  71.4491 },
  'Tbilisi':        { lat: 41.7151,  lng:  44.8271 },
  'Baku':           { lat: 40.4093,  lng:  49.8671 },
};


/* ═══════════════════════════════════════════════════════════════════════════════
 * 3. REGION CENTROIDS — fallback when only a continent/region name is available
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const REGION_CENTROIDS: Record<string, NamedLocation> = {
  'North America':    { name: 'North America',    lat:  48.0,  lng: -100.0 },
  'South America':    { name: 'South America',    lat: -15.0,  lng:  -60.0 },
  'Central America':  { name: 'Central America',  lat:  15.0,  lng:  -87.0 },
  'Europe':           { name: 'Europe',           lat:  50.0,  lng:   15.0 },
  'Western Europe':   { name: 'Western Europe',   lat:  48.0,  lng:    3.0 },
  'Eastern Europe':   { name: 'Eastern Europe',   lat:  52.0,  lng:   30.0 },
  'Africa':           { name: 'Africa',           lat:   2.0,  lng:   22.0 },
  'North Africa':     { name: 'North Africa',     lat:  28.0,  lng:   10.0 },
  'Sub-Saharan Africa': { name: 'Sub-Saharan Africa', lat: -5.0, lng: 25.0 },
  'East Africa':      { name: 'East Africa',      lat:  -2.0,  lng:   37.0 },
  'West Africa':      { name: 'West Africa',      lat:  10.0,  lng:   -3.0 },
  'Southern Africa':  { name: 'Southern Africa',  lat: -25.0,  lng:   27.0 },
  'Middle East':      { name: 'Middle East',      lat:  29.0,  lng:   42.0 },
  'Central Asia':     { name: 'Central Asia',     lat:  43.0,  lng:   65.0 },
  'South Asia':       { name: 'South Asia',       lat:  22.0,  lng:   78.0 },
  'East Asia':        { name: 'East Asia',        lat:  35.0,  lng: 110.0 },
  'Southeast Asia':   { name: 'Southeast Asia',   lat:   5.0,  lng: 108.0 },
  'Asia':             { name: 'Asia',             lat:  34.0,  lng:  100.0 },
  'Oceania':          { name: 'Oceania',          lat: -22.0,  lng:  140.0 },
  'Pacific':          { name: 'Pacific',          lat:   0.0,  lng:  180.0 },
  'Caribbean':        { name: 'Caribbean',        lat:  18.0,  lng:  -72.0 },
  'Scandinavia':      { name: 'Scandinavia',      lat:  62.0,  lng:   15.0 },
  'Balkans':          { name: 'Balkans',          lat:  42.0,  lng:   21.0 },
  'Arctic':           { name: 'Arctic',           lat:  82.0,  lng:    0.0 },
  'Antarctica':       { name: 'Antarctica',       lat: -82.0,  lng:    0.0 },
};


/* ═══════════════════════════════════════════════════════════════════════════════
 * 4. HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Look up coordinates by ISO 3166-1 alpha-2 country code.
 * Returns the capital city coordinates or null if unknown.
 */
export function getCountryCoords(countryCode: string): LatLng | null {
  const entry = COUNTRY_CAPITALS[countryCode.toUpperCase()];
  return entry ? { lat: entry.lat, lng: entry.lng } : null;
}

/**
 * Look up coordinates for a major city by name.
 * Case-insensitive; tries exact match first, then substring.
 */
export function getCityCoords(cityName: string): LatLng | null {
  const lower = cityName.toLowerCase().trim();

  // Exact match (case-insensitive)
  for (const [name, coords] of Object.entries(MAJOR_CITIES)) {
    if (name.toLowerCase() === lower) return coords;
  }

  // Also check capital names in COUNTRY_CAPITALS
  for (const entry of Object.values(COUNTRY_CAPITALS)) {
    if (entry.name.toLowerCase() === lower) {
      return { lat: entry.lat, lng: entry.lng };
    }
  }

  return null;
}

/* ── Pre-built lookup tables for extractLocationFromText ── */

// Build a sorted-by-length-desc list so longer names match first
// (e.g., "Ho Chi Minh City" before "Ho", "New York" before "York")
interface TextEntry {
  lower: string;
  location: NamedLocation;
}

const _textEntries: TextEntry[] = [];

// Add cities
for (const [name, coords] of Object.entries(MAJOR_CITIES)) {
  _textEntries.push({
    lower: name.toLowerCase(),
    location: { name, lat: coords.lat, lng: coords.lng },
  });
}

// Add country capitals that aren't already in MAJOR_CITIES
const _cityLowers = new Set(_textEntries.map(e => e.lower));
for (const [code, entry] of Object.entries(COUNTRY_CAPITALS)) {
  if (!_cityLowers.has(entry.name.toLowerCase())) {
    _textEntries.push({
      lower: entry.name.toLowerCase(),
      location: { name: entry.name, lat: entry.lat, lng: entry.lng },
    });
  }
  // Also add the country code as a keyword (but only match 2-letter codes
  // when they appear as standalone words — handled via word-boundary below)
  _textEntries.push({
    lower: `[code:${code.toLowerCase()}]`,
    location: { name: entry.name, lat: entry.lat, lng: entry.lng },
  });
}

// Add region centroids
for (const [name, loc] of Object.entries(REGION_CENTROIDS)) {
  _textEntries.push({
    lower: name.toLowerCase(),
    location: loc,
  });
}

// Common country-name aliases → code (for text matching)
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states':      'US', 'usa':               'US', 'america':            'US',
  'united kingdom':     'GB', 'uk':                'GB', 'britain':            'GB',
  'great britain':      'GB', 'england':           'GB', 'scotland':           'GB',
  'wales':              'GB',
  'china':              'CN', 'peoples republic of china': 'CN',
  'russia':             'RU', 'russian federation': 'RU',
  'south korea':        'KR', 'north korea':       'KP',
  'japan':              'JP', 'india':             'IN', 'pakistan':           'PK',
  'france':             'FR', 'germany':           'DE', 'italy':             'IT',
  'spain':              'ES', 'portugal':          'PT', 'netherlands':       'NL',
  'belgium':            'BE', 'switzerland':       'CH', 'austria':           'AT',
  'poland':             'PL', 'sweden':            'SE', 'norway':            'NO',
  'denmark':            'DK', 'finland':           'FI', 'ireland':           'IE',
  'greece':             'GR', 'turkey':            'TR', 'türkiye':           'TR',
  'ukraine':            'UA', 'romania':           'RO', 'hungary':           'HU',
  'czech republic':     'CZ', 'czechia':           'CZ',
  'slovakia':           'SK', 'croatia':           'HR', 'serbia':            'RS',
  'bulgaria':           'BG', 'estonia':           'EE', 'latvia':            'LV',
  'lithuania':          'LT', 'moldova':           'MD',
  'brazil':             'BR', 'argentina':         'AR', 'colombia':          'CO',
  'chile':              'CL', 'peru':              'PE', 'venezuela':         'VE',
  'mexico':             'MX', 'canada':            'CA', 'cuba':              'CU',
  'australia':          'AU', 'new zealand':       'NZ',
  'egypt':              'EG', 'south africa':      'ZA', 'nigeria':           'NG',
  'kenya':              'KE', 'ethiopia':          'ET', 'ghana':             'GH',
  'morocco':            'MA', 'algeria':           'DZ', 'tunisia':           'TN',
  'libya':              'LY', 'sudan':             'SD', 'south sudan':       'SS',
  'somalia':            'SO', 'tanzania':          'TZ', 'uganda':            'UG',
  'congo':              'CD', 'dr congo':          'CD', 'democratic republic of congo': 'CD',
  'cameroon':           'CM', 'ivory coast':       'CI', 'senegal':           'SN',
  'mozambique':         'MZ', 'angola':            'AO', 'zimbabwe':          'ZW',
  'zambia':             'ZM', 'rwanda':            'RW', 'mali':              'ML',
  'saudi arabia':       'SA', 'iran':              'IR', 'iraq':              'IQ',
  'israel':             'IL', 'palestine':         'PS', 'jordan':            'JO',
  'lebanon':            'LB', 'syria':             'SY', 'yemen':             'YE',
  'oman':               'OM', 'qatar':             'QA', 'bahrain':           'BH',
  'kuwait':             'KW', 'uae':               'AE',
  'united arab emirates': 'AE',
  'afghanistan':        'AF', 'bangladesh':        'BD', 'myanmar':           'MM',
  'thailand':           'TH', 'vietnam':           'VN', 'philippines':       'PH',
  'indonesia':          'ID', 'malaysia':          'MY', 'singapore':         'SG',
  'cambodia':           'KH', 'nepal':             'NP', 'sri lanka':         'LK',
  'taiwan':             'TW', 'hong kong':         'HK', 'mongolia':          'MN',
  'kazakhstan':         'KZ', 'uzbekistan':        'UZ', 'georgia':           'GE',
  'armenia':            'AM', 'azerbaijan':        'AZ',
  'north macedonia':    'MK', 'bosnia':            'BA',
  'bosnia and herzegovina': 'BA',
  'kosovo':             'XK', 'montenegro':        'ME', 'albania':           'AL',
  'iceland':            'IS',
};

// Add country names to the text entries
for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
  const capital = COUNTRY_CAPITALS[code];
  if (capital) {
    _textEntries.push({
      lower: name,
      location: { name: capital.name + ', ' + name.charAt(0).toUpperCase() + name.slice(1), lat: capital.lat, lng: capital.lng },
    });
  }
}

// Sort longest-first so longer matches win
const _sortedTextEntries = _textEntries
  .filter(e => !e.lower.startsWith('[code:'))
  .sort((a, b) => b.lower.length - a.lower.length);

/**
 * Attempt to extract a geographic location from free-form text (e.g. a news
 * headline or article snippet). Uses simple keyword matching — longest match
 * wins. Returns null if no location keyword is found.
 */
export function extractLocationFromText(text: string): NamedLocation | null {
  const lower = text.toLowerCase();

  // Try longest city/country/region names first
  for (const entry of _sortedTextEntries) {
    const idx = lower.indexOf(entry.lower);
    if (idx !== -1) {
      // Verify it's a word boundary (not a substring of a larger word)
      const before = idx > 0 ? lower[idx - 1] : ' ';
      const after  = idx + entry.lower.length < lower.length
        ? lower[idx + entry.lower.length]
        : ' ';
      const isBoundary = (c: string) =>
        /[\s,.:;!?'"()\-\[\]\/]/.test(c) || c === undefined;

      if (isBoundary(before) && isBoundary(after)) {
        return entry.location;
      }
    }
  }

  // Try 2-letter country codes as standalone uppercase words in the ORIGINAL text
  const codeMatch = text.match(/\b([A-Z]{2})\b/);
  if (codeMatch) {
    const code = codeMatch[1];
    const capital = COUNTRY_CAPITALS[code];
    if (capital) {
      return { name: capital.name, lat: capital.lat, lng: capital.lng };
    }
  }

  return null;
}
