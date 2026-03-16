import { useState, useRef, useEffect, useCallback } from 'react';
import './NotepadPlusPlus.css';

// ─── File Icons ────────────────────────────────────────────────────────────
const FILE_ICONS: Record<string, string> = {
  html: '🌐',
  css:  '🎨',
  js:   '⚡',
  md:   '📝',
  py:   '🐍',
};

function getIcon(filename: string): string {
  const ext = filename.split('.').pop() ?? '';
  return FILE_ICONS[ext] ?? '📄';
}

// ─── Pre-loaded File Content ───────────────────────────────────────────────
const INITIAL_FILES: FileTab[] = [
  {
    id: 'index.html',
    name: 'index.html',
    lang: 'html',
    dirty: false,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>My Awesome App</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
</head>
<body>
    <!-- Main application wrapper -->
    <div id="app" class="container">
        <header class="site-header">
            <nav class="navbar" role="navigation" aria-label="main navigation">
                <a class="navbar-brand" href="/">
                    <img src="/logo.svg" alt="Logo" width="120" height="40">
                </a>
                <ul class="nav-links">
                    <li><a href="#home" class="active">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </header>

        <main class="main-content">
            <section id="hero" class="hero-section">
                <h1 class="hero-title">Welcome to My App</h1>
                <p class="hero-subtitle">
                    Building something amazing, one line at a time.
                </p>
                <button id="cta-btn" class="btn btn-primary" data-action="start">
                    Get Started &rarr;
                </button>
            </section>

            <section id="features" class="features-grid">
                <div class="feature-card" data-index="0">
                    <span class="icon">&#128640;</span>
                    <h3>Fast &amp; Reliable</h3>
                    <p>Optimized for performance at every layer.</p>
                </div>
                <div class="feature-card" data-index="1">
                    <span class="icon">&#128274;</span>
                    <h3>Secure by Default</h3>
                    <p>HTTPS everywhere, CSP headers enforced.</p>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <p>&copy; 2025 My App. All rights reserved.</p>
        </footer>
    </div>

    <!-- Scripts -->
    <script src="app.js" defer></script>
</body>
</html>`,
  },
  {
    id: 'style.css',
    name: 'style.css',
    lang: 'css',
    dirty: false,
    content: `/* =========================================================
   Main Stylesheet – style.css
   Author : Dev Team
   Version: 2.4.1
   ========================================================= */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

/* ── CSS Custom Properties ─────────────────────────────── */
:root {
    --color-primary:    #0a7ad1;
    --color-secondary:  #6c757d;
    --color-success:    #28a745;
    --color-danger:     #dc3545;
    --color-warning:    #ffc107;
    --color-bg:         #f8f9fa;
    --color-text:       #212529;
    --font-base:        'Inter', system-ui, -apple-system, sans-serif;
    --font-mono:        'Courier New', Consolas, monospace;
    --radius-sm:        4px;
    --radius-md:        8px;
    --radius-lg:        16px;
    --shadow-sm:        0 1px 3px rgba(0, 0, 0, 0.12);
    --shadow-md:        0 4px 12px rgba(0, 0, 0, 0.15);
    --transition-base:  0.2s ease-in-out;
}

/* ── Reset & Base ──────────────────────────────────────── */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
}

body {
    font-family: var(--font-base);
    background-color: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
    min-height: 100vh;
}

/* ── Layout ────────────────────────────────────────────── */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* ── Navigation ────────────────────────────────────────── */
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    z-index: 100;
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

.nav-links a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-base);
}

.nav-links a:hover,
.nav-links a.active {
    color: var(--color-primary);
}

/* ── Buttons ───────────────────────────────────────────── */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all var(--transition-base);
}

.btn-primary {
    background-color: var(--color-primary);
    color: #fff;
}

.btn-primary:hover {
    background-color: #0860a8;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

/* ── Hero Section ──────────────────────────────────────── */
.hero-section {
    padding: 6rem 0 4rem;
    text-align: center;
}

.hero-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--color-primary), #7b2fbe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* ── Feature Cards ─────────────────────────────────────── */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 3rem 0;
}

.feature-card {
    padding: 2rem;
    background: #fff;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

/* ── Media Queries ─────────────────────────────────────── */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    .hero-title {
        font-size: 2rem;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-bg:   #121212;
        --color-text: #e0e0e0;
    }

    .navbar {
        background: rgba(18, 18, 18, 0.95);
    }

    .feature-card {
        background: #1e1e1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
}`,
  },
  {
    id: 'app.js',
    name: 'app.js',
    lang: 'js',
    dirty: false,
    content: `/**
 * app.js – Main Application Entry Point
 * @version 3.1.0
 * @author  Dev Team
 */

'use strict';

// ── Constants ────────────────────────────────────────────
const API_BASE    = 'https://api.myapp.com/v2';
const MAX_RETRIES = 3;
const TIMEOUT_MS  = 5000;

// ── Utility Functions ────────────────────────────────────

/**
 * Debounce a function call.
 * @param {Function} fn   - Function to debounce
 * @param {number}   wait - Milliseconds to wait
 * @returns {Function}
 */
function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

/**
 * Fetch JSON with automatic retry and timeout.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function fetchJSON(url, options = {}) {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }

            return await response.json();
        } catch (err) {
            if (attempt === MAX_RETRIES) throw err;
            // Exponential back-off: 200ms, 400ms, 800ms …
            await new Promise(resolve => setTimeout(resolve, 200 * 2 ** attempt));
        }
    }
}

// ── State Management ─────────────────────────────────────

const store = (() => {
    let state = {
        user:     null,
        theme:    localStorage.getItem('theme') ?? 'light',
        features: [],
        loading:  false,
    };

    const listeners = new Set();

    return {
        getState:  () => ({ ...state }),
        subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
        dispatch:  (action) => {
            state = reducer(state, action);
            listeners.forEach(fn => fn(state));
        },
    };
})();

function reducer(state, action) {
    switch (action.type) {
        case 'SET_USER':    return { ...state, user:     action.payload };
        case 'SET_THEME':   return { ...state, theme:    action.payload };
        case 'SET_LOADING': return { ...state, loading:  action.payload };
        case 'SET_FEATURES':return { ...state, features: action.payload };
        default:            return state;
    }
}

// ── Components ───────────────────────────────────────────

class Modal {
    /** @param {{ title: string; content: string; onClose?: () => void }} opts */
    constructor({ title, content, onClose }) {
        this.el       = this.#build(title, content);
        this.onClose  = onClose ?? (() => {});
        document.body.appendChild(this.el);
    }

    #build(title, content) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = \`
            <div class="modal" role="dialog" aria-modal="true">
                <header class="modal-header">
                    <h2>\${title}</h2>
                    <button class="modal-close" aria-label="Close">&times;</button>
                </header>
                <div class="modal-body">\${content}</div>
            </div>
        \`;
        overlay.querySelector('.modal-close').addEventListener('click', () => this.close());
        overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
        return overlay;
    }

    close() {
        this.el.remove();
        this.onClose();
    }
}

// ── Event Handlers ───────────────────────────────────────

const handleCtaClick = debounce(async () => {
    store.dispatch({ type: 'SET_LOADING', payload: true });

    try {
        const data = await fetchJSON(\`\${API_BASE}/features\`);
        store.dispatch({ type: 'SET_FEATURES', payload: data.items });

        new Modal({
            title:   'Welcome!',
            content: \`<p>Loaded \${data.items.length} features.</p>\`,
        });
    } catch (err) {
        console.error('Failed to load features:', err);
    } finally {
        store.dispatch({ type: 'SET_LOADING', payload: false });
    }
}, 300);

// ── Initialisation ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const ctaBtn = document.getElementById('cta-btn');
    ctaBtn?.addEventListener('click', handleCtaClick);

    // Apply saved theme
    const { theme } = store.getState();
    document.documentElement.setAttribute('data-theme', theme);

    console.log('%c App initialised ✓', 'color: #0a7ad1; font-weight: bold;');
});`,
  },
  {
    id: 'README.md',
    name: 'README.md',
    lang: 'md',
    dirty: false,
    content: `# My Awesome App

> A modern, fast, and secure web application.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**My Awesome App** is a lightweight single-page application built with
vanilla HTML, CSS, and JavaScript. It focuses on:

- **Performance** – zero runtime dependencies in production
- **Accessibility** – WCAG 2.1 AA compliant
- **Security** – strict CSP, SRI hashes, HTTPS-only

---

## Prerequisites

| Tool    | Version  |
|---------|----------|
| Node.js | >= 18.0  |
| npm     | >= 9.0   |
| Git     | >= 2.40  |

---

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/example/my-awesome-app.git
cd my-awesome-app

# Install dev dependencies
npm install

# Start development server (port 3000)
npm run dev
\`\`\`

---

## Usage

\`\`\`bash
# Run linter
npm run lint

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
\`\`\`

---

## Configuration

Copy \`.env.example\` to \`.env\` and adjust values:

\`\`\`ini
API_BASE=https://api.myapp.com/v2
TIMEOUT_MS=5000
MAX_RETRIES=3
\`\`\`

> **Note:** Never commit your \`.env\` file to version control.

---

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feat/amazing-feature\`
3. Commit your changes: \`git commit -m "feat: add amazing feature"\`
4. Push to the branch: \`git push origin feat/amazing-feature\`
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our
code of conduct and the process for submitting pull requests.

---

## License

This project is licensed under the **MIT License** – see the
[LICENSE](./LICENSE) file for details.

---

*Built with ❤️  by the Dev Team*`,
  },
  {
    id: 'config.py',
    name: 'config.py',
    lang: 'py',
    dirty: false,
    content: `#!/usr/bin/env python3
"""
config.py – Application Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Centralised settings using Pydantic v2 BaseSettings.
Environment variables override defaults automatically.
"""

from __future__ import annotations

import os
import logging
from enum import Enum
from pathlib import Path
from typing import Any, Optional

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# ── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent


# ── Enumerations ─────────────────────────────────────────────────────────────
class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING     = "staging"
    PRODUCTION  = "production"


class LogLevel(str, Enum):
    DEBUG    = "DEBUG"
    INFO     = "INFO"
    WARNING  = "WARNING"
    ERROR    = "ERROR"
    CRITICAL = "CRITICAL"


# ── Database Settings ─────────────────────────────────────────────────────────
class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DB_")

    host:     str = Field("localhost", description="Database host")
    port:     int = Field(5432,        description="Database port")
    name:     str = Field("myapp_db",  description="Database name")
    user:     str = Field("postgres",  description="Database user")
    password: str = Field("",          description="Database password")
    pool_min: int = Field(2,           description="Min pool connections")
    pool_max: int = Field(10,          description="Max pool connections")

    @property
    def dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.name}"
        )


# ── Cache Settings ────────────────────────────────────────────────────────────
class CacheSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CACHE_")

    host:    str = Field("localhost", description="Redis host")
    port:    int = Field(6379,        description="Redis port")
    db:      int = Field(0,           description="Redis DB index")
    ttl_sec: int = Field(3600,        description="Default TTL (seconds)")

    @property
    def url(self) -> str:
        return f"redis://{self.host}:{self.port}/{self.db}"


# ── Main Application Settings ─────────────────────────────────────────────────
class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Core
    app_name:    str         = "My Awesome App"
    app_version: str         = "3.1.0"
    environment: Environment = Environment.DEVELOPMENT
    debug:       bool        = False
    secret_key:  str         = Field(..., description="REQUIRED: Secret key for JWT signing")

    # Server
    host:        str = "0.0.0.0"
    port:        int = 8000
    workers:     int = 4
    reload:      bool = False

    # API
    api_prefix:  str         = "/api/v2"
    api_base_url: AnyHttpUrl = "https://api.myapp.com/v2"  # type: ignore[assignment]
    allowed_origins: list[str] = ["http://localhost:3000", "https://myapp.com"]
    max_retries: int = 3
    timeout_ms:  int = 5000

    # Logging
    log_level:   LogLevel    = LogLevel.INFO
    log_json:    bool        = False

    # Nested settings
    db:    DatabaseSettings = Field(default_factory=DatabaseSettings)
    cache: CacheSettings    = Field(default_factory=CacheSettings)

    @field_validator("workers")
    @classmethod
    def validate_workers(cls, v: int) -> int:
        cpu_count = os.cpu_count() or 1
        if v > cpu_count * 4:
            log.warning(
                "workers=%d exceeds 4×CPU (%d). Consider lowering it.", v, cpu_count
            )
        return v

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret_key must be at least 32 characters long")
        return v

    def is_production(self) -> bool:
        return self.environment == Environment.PRODUCTION

    def get_log_config(self) -> dict[str, Any]:
        return {
            "version":            1,
            "disable_existing_loggers": False,
            "root": {
                "level":   self.log_level.value,
                "handlers": ["json" if self.log_json else "console"],
            },
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
_settings: Optional[AppSettings] = None


def get_settings() -> AppSettings:
    """Return cached AppSettings instance (thread-safe singleton)."""
    global _settings
    if _settings is None:
        _settings = AppSettings()  # type: ignore[call-arg]
        log.info(
            "Config loaded | env=%s | debug=%s",
            _settings.environment.value,
            _settings.debug,
        )
    return _settings`,
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────
interface FileTab {
  id:      string;
  name:    string;
  lang:    string;
  content: string;
  dirty:   boolean;
}

// ─── Syntax Highlighters ───────────────────────────────────────────────────

/** Escape HTML special characters */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightHTML(code: string): string {
  return esc(code)
    // DOCTYPE
    .replace(/(&lt;!DOCTYPE[^&]*?&gt;)/gi, '<span class="hl-doctype">$1</span>')
    // Comments
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-comment">$1</span>')
    // Closing tags
    .replace(/(&lt;\/)([\w-]+)(&gt;)/g,
      '<span class="hl-tag">$1$2$3</span>')
    // Opening/void tags with attributes
    .replace(/(&lt;)([\w-]+)((?:\s+[\w-:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s&>]*))?)*\s*\/?)(&gt;)/g,
      (_, open, tag, attrs, close) => {
        const coloredAttrs = attrs
          .replace(/([\w-:]+)(\s*=\s*)("([^"]*)")/g,
            '<span class="hl-attr">$1</span>$2<span class="hl-string">&quot;$4&quot;</span>')
          .replace(/([\w-:]+)(?!\s*=)/g, '<span class="hl-attr">$1</span>');
        return `<span class="hl-tag">${open}${tag}${coloredAttrs}${close}</span>`;
      });
}

function highlightCSS(code: string): string {
  const lines = code.split('\n');
  return lines.map(line => {
    const escaped = esc(line);
    // Block comments
    if (/\/\*/.test(escaped) || /\*\//.test(escaped) || escaped.trimStart().startsWith('*')) {
      return `<span class="hl-comment">${escaped}</span>`;
    }
    // @rules
    if (/^@/.test(escaped.trim())) {
      return `<span class="hl-at-rule">${escaped}</span>`;
    }
    // Selectors (lines ending in { or lines with only selector text)
    if (/\{/.test(escaped) && !/:/.test(escaped)) {
      return escaped.replace(/([^{]+)(\{)/, '<span class="hl-selector">$1</span>$2');
    }
    // Properties: value; pairs
    if (/:\s*/.test(escaped) && /;/.test(escaped)) {
      return escaped.replace(
        /(\s*)([\w-]+)(\s*:\s*)(.+?)(;)/,
        '$1<span class="hl-property">$2</span>$3<span class="hl-value">$4</span>$5'
      );
    }
    return escaped;
  }).join('\n');
}

function highlightJS(code: string): string {
  const KEYWORDS = /\b(const|let|var|function|class|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|in|of|import|export|default|from|async|async function|await|try|catch|finally|throw|this|super|extends|static|get|set|null|undefined|true|false|void|yield)\b/g;

  return esc(code)
    // Template literals
    .replace(/(`)([^`]*?)(`)/g, '<span class="hl-string">$1$2$3</span>')
    // Block comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-comment">$1</span>')
    // Line comments
    .replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>')
    // Strings (double)
    .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span class="hl-string">$1</span>')
    // Strings (single) — avoid replacing inside already-wrapped spans
    .replace(/('(?:[^'\\]|\\.)*?')/g, '<span class="hl-string">$1</span>')
    // Numbers
    .replace(/\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span class="hl-number">$1</span>')
    // Keywords
    .replace(KEYWORDS, '<span class="hl-keyword">$1</span>')
    // Function names
    .replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, '<span class="hl-function">$1</span>');
}

function highlightPython(code: string): string {
  const KEYWORDS = /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|assert|del|in|not|and|or|is|True|False|None|async|await)\b/g;
  const BUILTINS = /\b(print|len|range|list|dict|tuple|set|str|int|float|bool|type|isinstance|hasattr|getattr|setattr|enumerate|zip|map|filter|sorted|reversed|open|super|property|staticmethod|classmethod|abs|round|min|max|sum|any|all)\b/g;

  return esc(code)
    // Decorators
    .replace(/(^\s*@[\w.]+)/gm, '<span class="hl-decorator">$1</span>')
    // Triple-quoted strings
    .replace(/("""[\s\S]*?""")/g, '<span class="hl-string">$1</span>')
    .replace(/(\'\'\'[\s\S]*?\'\'\')/g, '<span class="hl-string">$1</span>')
    // Comments
    .replace(/(#.*)/g, '<span class="hl-comment">$1</span>')
    // Strings double
    .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span class="hl-string">$1</span>')
    // Strings single
    .replace(/('(?:[^'\\]|\\.)*?')/g, '<span class="hl-string">$1</span>')
    // Numbers
    .replace(/\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span class="hl-number">$1</span>')
    // Keywords
    .replace(KEYWORDS, '<span class="hl-keyword">$1</span>')
    // Builtins
    .replace(BUILTINS, '<span class="hl-builtin">$1</span>')
    // Function / class names
    .replace(/\b(def|class)\s+([a-zA-Z_]\w*)/g,
      '<span class="hl-keyword">$1</span> <span class="hl-function">$2</span>');
}

function highlightMarkdown(code: string): string {
  const lines = code.split('\n');
  return lines.map(line => {
    const e = esc(line);
    if (/^#{1,6}\s/.test(e))    return `<span class="hl-heading">${e}</span>`;
    if (/^(---|\*\*\*|___)$/.test(e.trim())) return `<span class="hl-hr">${e}</span>`;
    if (/^(```|~~~)/.test(e.trim())) return `<span class="hl-fence">${e}</span>`;
    if (/^&gt;/.test(e.trim())) return `<span class="hl-blockquote">${e}</span>`;
    if (/^(\s*[-*+]|\s*\d+\.)/.test(e)) {
      return e.replace(/^(\s*[-*+]|\s*\d+\.)/, '<span class="hl-list-mark">$1</span>');
    }
    return e
      .replace(/(`[^`]+`)/g, '<span class="hl-md-code">$1</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="hl-bold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="hl-italic">$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<span class="hl-link">[$1]</span><span class="hl-md-url">($2)</span>');
  }).join('\n');
}

function highlight(lang: string, code: string): string {
  switch (lang) {
    case 'html': return highlightHTML(code);
    case 'css':  return highlightCSS(code);
    case 'js':   return highlightJS(code);
    case 'py':   return highlightPython(code);
    case 'md':   return highlightMarkdown(code);
    default:     return esc(code);
  }
}

// ─── Toolbar Definition ────────────────────────────────────────────────────
const TOOLBAR_ITEMS = [
  { icon: '📄', title: 'New (Ctrl+N)' },
  { icon: '📂', title: 'Open (Ctrl+O)' },
  { icon: '💾', title: 'Save (Ctrl+S)' },
  { icon: '🖨️', title: 'Print (Ctrl+P)' },
  null,
  { icon: '✂️', title: 'Cut (Ctrl+X)' },
  { icon: '📋', title: 'Copy (Ctrl+C)' },
  { icon: '📌', title: 'Paste (Ctrl+V)' },
  null,
  { icon: '↩️', title: 'Undo (Ctrl+Z)' },
  { icon: '↪️', title: 'Redo (Ctrl+Y)' },
  null,
  { icon: '🔍', title: 'Find (Ctrl+F)' },
  { icon: '🔄', title: 'Replace (Ctrl+H)' },
  null,
  { icon: '🔎', title: 'Zoom In (Ctrl++)' },
  { icon: '🔍', title: 'Zoom Out (Ctrl+-)' },
];

// ─── Main Component ────────────────────────────────────────────────────────
export default function NotepadPlusPlus() {
  const [tabs, setTabs] = useState<FileTab[]>(INITIAL_FILES);
  const [activeId, setActiveId] = useState<string>(INITIAL_FILES[0].id);

  // Editor mode: show highlighted view or raw textarea
  const [editMode, setEditMode] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef  = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0];
  const lines     = activeTab.content.split('\n');

  // ── Cursor tracking for status bar
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol,  setCursorCol]  = useState(1);

  // ── Sync line-number panel scroll with editor scroll
  const handleEditorScroll = useCallback(() => {
    if (scrollRef.current && lineNumRef.current) {
      lineNumRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  }, []);

  // Reset cursor on tab change
  useEffect(() => {
    setCursorLine(1);
    setCursorCol(1);
    setEditMode(false);
  }, [activeId]);

  // ── Tab actions
  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (remaining.length === 0) return prev; // keep at least one
      if (activeId === id) {
        const idx = prev.findIndex(t => t.id === id);
        const next = remaining[Math.min(idx, remaining.length - 1)];
        setActiveId(next.id);
      }
      return remaining;
    });
  };

  const updateContent = (value: string) => {
    setTabs(prev => prev.map(t =>
      t.id === activeId ? { ...t, content: value, dirty: value !== INITIAL_FILES.find(f => f.id === activeId)?.content } : t
    ));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end   = el.selectionEnd;
      const newVal = activeTab.content.substring(0, start) + '    ' + activeTab.content.substring(end);
      updateContent(newVal);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 4; }, 0);
    }
  };

  const handleCursorUpdate = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const val = el.value.substring(0, el.selectionStart);
    const newLine = val.split('\n').length;
    const newCol  = val.split('\n').pop()!.length + 1;
    setCursorLine(newLine);
    setCursorCol(newCol);
  };

  // ── Language label for status bar
  const LANG_LABELS: Record<string, string> = {
    html: 'HTML',
    css:  'CSS',
    js:   'JavaScript',
    py:   'Python',
    md:   'Markdown',
  };

  const highlightedHTML = highlight(activeTab.lang, activeTab.content);

  return (
    <div className="npp">

      {/* ── Menu Bar ───────────────────────────────────────────────────── */}
      <div className="npp-menubar">
        {['File', 'Edit', 'View', 'Search', 'Language', 'Settings', 'Plugins', 'Window', '?'].map(item => (
          <button key={item} className="npp-menu-item">{item}</button>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="npp-toolbar">
        {TOOLBAR_ITEMS.map((item, i) =>
          item === null
            ? <div key={`sep-${i}`} className="npp-toolbar-separator" />
            : (
              <button key={item.title} className="npp-toolbar-btn" title={item.title}>
                {item.icon}
              </button>
            )
        )}
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────── */}
      <div className="npp-tabbar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`npp-tab${tab.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            <span className="npp-tab-icon">{getIcon(tab.name)}</span>
            <span className="npp-tab-name">{tab.name}</span>
            {tab.dirty && <span className="npp-tab-dirty">*</span>}
            <button
              className="npp-tab-close"
              onClick={e => closeTab(tab.id, e)}
              title={`Close ${tab.name}`}
            >×</button>
          </div>
        ))}
      </div>

      {/* ── Editor Body ────────────────────────────────────────────────── */}
      <div className="npp-editor-body">

        {/* Line Numbers Panel */}
        <div className="npp-line-numbers" ref={lineNumRef}>
          {lines.map((_, i) => (
            <span
              key={i}
              className={`npp-line-number${i + 1 === cursorLine ? ' active-line' : ''}`}
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Scrollable Editor */}
        <div
          className="npp-editor-scroll"
          ref={scrollRef}
          onScroll={handleEditorScroll}
          onClick={() => { if (!editMode) setEditMode(true); }}
        >
          {editMode ? (
            <textarea
              ref={textareaRef}
              className="npp-textarea"
              value={activeTab.content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onClick={handleCursorUpdate}
              onKeyUp={handleCursorUpdate}
              onSelect={handleCursorUpdate}
              spellCheck={false}
              autoFocus
            />
          ) : (
            <div
              className="npp-highlighted"
              dangerouslySetInnerHTML={{ __html: highlightedHTML }}
            />
          )}
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="npp-statusbar">
        <div className="npp-status-cell">
          Ln {cursorLine}, Col {cursorCol}
        </div>
        <div className="npp-status-cell">
          Sel 0|0
        </div>
        <div className="npp-status-cell">
          {lines.length} lines
        </div>
        <div className="npp-status-cell">
          {activeTab.dirty ? 'Modified' : 'Saved'}
        </div>
        <div className="npp-status-cell">
          UTF-8
        </div>
        <div className="npp-status-cell">
          Windows (CR LF)
        </div>
        <div className="npp-status-cell">
          {LANG_LABELS[activeTab.lang] ?? activeTab.lang}
        </div>
        <div className="npp-status-cell" style={{ marginLeft: 'auto' }}>
          INS
        </div>
      </div>

    </div>
  );
}
