/* ═══════════════════════════════════════════════════════════════════════════
 * World Globe News — Complete Visual System
 * Premium dark theme for a modern news application
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── News Category Colors ─────────────────────────────────────────────────
// Each color is vibrant enough to pop on dark backgrounds while remaining
// legible. Tested against #0D1117 for WCAG AA contrast.

export const CATEGORY_COLORS = {
  world:         '#4DA8FF', // clear sky blue — global, neutral, trustworthy
  politics:      '#A78BFA', // soft violet — authority, deliberation
  business:      '#34D399', // mint green — money, growth, markets
  technology:    '#22D3EE', // electric cyan — digital, innovation
  sports:        '#FB923C', // warm orange — energy, competition
  health:        '#F472B6', // rose pink — care, vitality
  science:       '#FACC15', // golden yellow — discovery, curiosity
  entertainment: '#E879F9', // magenta/fuchsia — creativity, pop culture
} as const;

// Dimmed variants for backgrounds, tags, and subtle accents (12% opacity feel)
export const CATEGORY_COLORS_DIM = {
  world:         '#4DA8FF1F',
  politics:      '#A78BFA1F',
  business:      '#34D3991F',
  technology:    '#22D3EE1F',
  sports:        '#FB923C1F',
  health:        '#F472B61F',
  science:       '#FACC151F',
  entertainment: '#E879F91F',
} as const;

export type NewsCategory = keyof typeof CATEGORY_COLORS;

// ─── Breaking News Indicator ──────────────────────────────────────────────
export const BREAKING = {
  primary:    '#EF4444', // vivid red — urgency
  secondary:  '#F97316', // hot orange — secondary pulse ring
  glow:       '#EF444466', // red glow for shadow/bloom
  text:       '#FFFFFF',
  bgStrip:    '#DC26261A', // subtle red banner background
} as const;

// ─── Time Freshness ──────────────────────────────────────────────────────
// Visual age indicator — brighter = newer
export const FRESHNESS = {
  justNow:  { color: '#F0F6FC', opacity: 1.0, label: 'Just now' },   // bright white
  oneHour:  { color: '#8B949E', opacity: 0.75, label: '1h ago' },    // neutral gray
  sixHours: { color: '#484F58', opacity: 0.50, label: '6h+ ago' },   // dimmed
} as const;

// ─── Source Reliability Tiers ─────────────────────────────────────────────
export const SOURCE_TIERS = {
  tier1: {
    label: 'Verified',
    badge:      '#FFD700', // gold
    badgeBg:    '#FFD70020',
    border:     '#FFD70044',
    icon:       'shield-check',
  },
  tier2: {
    label: 'Established',
    badge:      '#C0C0C0', // silver
    badgeBg:    '#C0C0C020',
    border:     '#C0C0C044',
    icon:       'shield',
  },
  tier3: {
    label: 'Unverified',
    badge:      '#CD7F32', // bronze
    badgeBg:    '#CD7F3220',
    border:     '#CD7F3244',
    icon:       'shield-alert',
  },
} as const;

// ─── UI Chrome ───────────────────────────────────────────────────────────
export const UI = {
  // Backgrounds (layered depth system — higher number = more elevated)
  bg: {
    base:       '#0D1117', // deepest background — app canvas
    surface:    '#161B22', // cards, panels
    elevated:   '#1C2128', // modals, popovers, dropdowns
    overlay:    '#21262D', // overlays on top of elevated surfaces
  },

  // Borders
  border: {
    subtle:     '#21262D', // between same-level surfaces
    default:    '#30363D', // standard panel borders
    emphasis:   '#484F58', // dividers that need to stand out
  },

  // Text
  text: {
    primary:    '#F0F6FC', // headlines, important content
    secondary:  '#C9D1D9', // body text, descriptions
    muted:      '#8B949E', // timestamps, metadata, labels
    disabled:   '#484F58', // disabled/inactive text
    link:       '#58A6FF', // clickable links
    linkHover:  '#79C0FF', // link hover state
  },

  // Accent (primary brand blue — used for CTAs, active states, focus rings)
  accent: {
    primary:    '#58A6FF', // main accent
    hover:      '#79C0FF', // hover state
    pressed:    '#388BFD', // active/pressed
    subtle:     '#58A6FF1A', // ghost button backgrounds, subtle highlights
  },

  // Semantic
  semantic: {
    success:    '#3FB950',
    warning:    '#D29922',
    error:      '#F85149',
    info:       '#58A6FF',
  },

  // Scrollbar
  scrollbar: {
    track:      '#0D1117',
    thumb:      '#30363D',
    thumbHover: '#484F58',
  },
} as const;

// ─── Globe Visual System ─────────────────────────────────────────────────
export const GLOBE = {
  // Ocean / base
  ocean:          '#0D1117',

  // Land masses
  land: {
    fill:         'rgba(33, 43, 54, 0.6)',   // subtle dark teal-gray
    stroke:       'rgba(88, 166, 255, 0.15)', // faint blue coastlines
    strokeWidth:  0.8,
  },

  // Graticule (grid lines)
  graticule: {
    stroke:       'rgba(48, 54, 61, 0.3)',
    strokeWidth:  0.4,
  },

  // Atmosphere glow (CSS radial gradient behind the globe)
  atmosphere: {
    inner:        'rgba(88, 166, 255, 0.08)',  // subtle blue halo
    outer:        'rgba(88, 166, 255, 0.00)',
  },

  // News pin markers on the globe
  pin: {
    default:      '#58A6FF',
    glow:         '#58A6FF55',
    glowRadius:   8,
    breaking:     '#EF4444',
    breakingGlow: '#EF444466',
  },

  // Arc lines connecting related stories / source-to-event
  arc: {
    primary:      '#58A6FF44', // standard arc
    breaking:     '#EF444444', // breaking news arc
    business:     '#34D39944', // financial/trade arcs
    gradient: {
      start:      '#58A6FF',
      end:        '#A78BFA',
    },
  },

  // Country highlight on hover
  countryHover: {
    fill:         'rgba(88, 166, 255, 0.12)',
    stroke:       'rgba(88, 166, 255, 0.4)',
  },
} as const;

// ─── Interactive States ──────────────────────────────────────────────────
export const INTERACTIVE = {
  hover: {
    bg:           '#1C2128',
    border:       '#484F58',
    scale:        1.02,      // subtle grow on hover
    transition:   '150ms ease',
  },
  selected: {
    bg:           '#58A6FF1A', // accent tint
    border:       '#58A6FF',
    text:         '#F0F6FC',
    ring:         '0 0 0 2px #58A6FF44', // focus ring box-shadow
  },
  disabled: {
    bg:           '#161B22',
    border:       '#21262D',
    text:         '#484F58',
    opacity:      0.5,
    cursor:       'not-allowed',
  },
  focus: {
    ring:         '0 0 0 2px #58A6FF66', // keyboard focus outline
  },
} as const;

// ─── Typography Scale ────────────────────────────────────────────────────
export const TYPE = {
  headline:   { size: '18px', weight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
  subhead:    { size: '14px', weight: 600, lineHeight: 1.4, letterSpacing: '0' },
  body:       { size: '13px', weight: 400, lineHeight: 1.5, letterSpacing: '0' },
  caption:    { size: '11px', weight: 400, lineHeight: 1.4, letterSpacing: '0.01em' },
  badge:      { size: '10px', weight: 600, lineHeight: 1.2, letterSpacing: '0.04em' },
  mono:       { size: '12px', weight: 400, lineHeight: 1.4, family: "'Cascadia Code', 'Fira Code', monospace" },
} as const;

// ─── Spacing System ──────────────────────────────────────────────────────
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────
export const RADIUS = {
  sm:   '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '12px',
  pill:  '9999px',
} as const;

// ─── Shadows (for elevated surfaces) ─────────────────────────────────────
export const SHADOW = {
  sm:   '0 1px 2px rgba(0, 0, 0, 0.3)',
  md:   '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg:   '0 8px 24px rgba(0, 0, 0, 0.5)',
  glow: (color: string) => `0 0 12px ${color}44, 0 0 4px ${color}22`,
} as const;

// ─── CSS Keyframe Animations (inject via <style> or CSS file) ────────────
// These are exported as strings so they can be injected into a <style> tag
// or appended to the Globe.css file.

export const KEYFRAMES = `
/* ── Breaking News Pulse ── */
@keyframes breakingPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

/* ── Breaking News Banner Shimmer ── */
@keyframes breakingShimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* ── Breaking News Text Flash ── */
@keyframes breakingTextFlash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ── Globe Pin Glow (news marker on map) ── */
@keyframes pinGlow {
  0%, 100% {
    r: 4;
    opacity: 0.9;
    filter: drop-shadow(0 0 3px rgba(88, 166, 255, 0.6));
  }
  50% {
    r: 6;
    opacity: 0.6;
    filter: drop-shadow(0 0 8px rgba(88, 166, 255, 0.9));
  }
}

/* ── Breaking Pin Glow (urgent marker) ── */
@keyframes breakingPinGlow {
  0%, 100% {
    r: 4;
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
  }
  50% {
    r: 7;
    opacity: 0.5;
    filter: drop-shadow(0 0 12px rgba(239, 68, 68, 1));
  }
}

/* ── Arc Draw-in Animation ── */
@keyframes arcDraw {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* ── Freshness Fade (article aging) ── */
@keyframes freshnessFade {
  0% {
    opacity: 1;
    border-left-color: #F0F6FC;
  }
  50% {
    opacity: 0.75;
    border-left-color: #8B949E;
  }
  100% {
    opacity: 0.5;
    border-left-color: #484F58;
  }
}

/* ── Category Badge Pop-in ── */
@keyframes badgePopIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ── Subtle Fade-in for Cards ── */
@keyframes cardFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Tier Badge Gleam (gold shimmer for Tier 1) ── */
@keyframes tierGleam {
  0%, 100% {
    background-position: -100% center;
  }
  50% {
    background-position: 200% center;
  }
}

/* ── Spin for Loading Globe ── */
@keyframes globeSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ── Atmosphere Breathe (subtle globe halo pulse) ── */
@keyframes atmosphereBreathe {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}
`;

// ─── CSS Class Helpers (for quick application) ────────────────────────────
export const CSS_CLASSES = `
/* ── Breaking News Indicators ── */
.breaking-badge {
  animation: breakingPulse 2s ease-in-out infinite;
  background: ${BREAKING.primary};
  color: ${BREAKING.text};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 3px;
}

.breaking-banner {
  background: linear-gradient(
    90deg,
    ${BREAKING.primary}00 0%,
    ${BREAKING.primary}22 25%,
    ${BREAKING.primary}22 75%,
    ${BREAKING.primary}00 100%
  );
  background-size: 200% 100%;
  animation: breakingShimmer 3s ease-in-out infinite;
  border-bottom: 1px solid ${BREAKING.primary}44;
}

.breaking-text {
  color: ${BREAKING.primary};
  font-weight: 700;
  animation: breakingTextFlash 1.5s ease-in-out infinite;
}

/* ── Globe Pin Classes ── */
.news-pin {
  animation: pinGlow 3s ease-in-out infinite;
}

.news-pin-breaking {
  animation: breakingPinGlow 1.5s ease-in-out infinite;
}

/* ── Arc Animation ── */
.news-arc {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: arcDraw 2s ease-out forwards;
}

/* ── Card Entry ── */
.news-card {
  animation: cardFadeIn 0.3s ease-out forwards;
  background: ${UI.bg.surface};
  border: 1px solid ${UI.border.subtle};
  border-radius: 6px;
}

.news-card:hover {
  background: ${INTERACTIVE.hover.bg};
  border-color: ${INTERACTIVE.hover.border};
  transition: all ${INTERACTIVE.hover.transition};
}

.news-card.selected {
  background: ${INTERACTIVE.selected.bg};
  border-color: ${INTERACTIVE.selected.border};
  box-shadow: ${INTERACTIVE.selected.ring};
}

/* ── Category Badge ── */
.category-badge {
  animation: badgePopIn 0.25s ease-out forwards;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 3px;
}

/* ── Tier Badge ── */
.tier-badge-1 {
  color: ${SOURCE_TIERS.tier1.badge};
  background: ${SOURCE_TIERS.tier1.badgeBg};
  border: 1px solid ${SOURCE_TIERS.tier1.border};
  background-image: linear-gradient(
    110deg,
    transparent 30%,
    rgba(255, 215, 0, 0.15) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: tierGleam 4s ease-in-out infinite;
}

.tier-badge-2 {
  color: ${SOURCE_TIERS.tier2.badge};
  background: ${SOURCE_TIERS.tier2.badgeBg};
  border: 1px solid ${SOURCE_TIERS.tier2.border};
}

.tier-badge-3 {
  color: ${SOURCE_TIERS.tier3.badge};
  background: ${SOURCE_TIERS.tier3.badgeBg};
  border: 1px solid ${SOURCE_TIERS.tier3.border};
}

/* ── Atmosphere Glow (behind globe SVG) ── */
.globe-atmosphere {
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${GLOBE.atmosphere.inner} 0%,
    ${GLOBE.atmosphere.outer} 70%
  );
  animation: atmosphereBreathe 6s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
`;

// ─── Utility: get category color by name ─────────────────────────────────
export function getCategoryColor(category: NewsCategory): string {
  return CATEGORY_COLORS[category];
}

export function getCategoryDimColor(category: NewsCategory): string {
  return CATEGORY_COLORS_DIM[category];
}

// ─── Utility: get freshness style based on age in minutes ────────────────
export function getFreshnessStyle(ageMinutes: number): { color: string; opacity: number } {
  if (ageMinutes <= 10) return FRESHNESS.justNow;
  if (ageMinutes <= 60) return FRESHNESS.oneHour;
  return FRESHNESS.sixHours;
}

// ─── Utility: get source tier config ─────────────────────────────────────
export function getSourceTier(tier: 1 | 2 | 3) {
  const map = { 1: SOURCE_TIERS.tier1, 2: SOURCE_TIERS.tier2, 3: SOURCE_TIERS.tier3 };
  return map[tier];
}
