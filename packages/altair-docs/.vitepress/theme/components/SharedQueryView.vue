<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SharedQueryContent {
  query?: string;
  variables?: string;
  apiUrl?: string;
  windowName?: string;
}

interface QueryItem {
  name: string;
  content: SharedQueryContent | null;
}

interface SharedQuery {
  shareId: string;
  query: QueryItem;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? 'https://api.altairgraphql.dev';

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const theme = ref<Theme>('light');

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<SharedQuery | null>(null);

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------

const queryName = computed(() => data.value?.query.name ?? 'Shared Query');
const gqlQuery = computed(() => data.value?.query.content?.query ?? '');
const apiUrl = computed(() => data.value?.query.content?.apiUrl ?? '');

const variables = computed(() => {
  const raw = data.value?.query.content?.variables ?? '';
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
});

// ---------------------------------------------------------------------------
// Extract shareId from ?id= query param
// ---------------------------------------------------------------------------

function getShareId(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('id');
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

onMounted(async () => {
  theme.value = getSystemTheme();
  document.documentElement.classList.toggle('dark', theme.value === 'dark');

  const shareId = getShareId();

  if (!shareId) {
    error.value = 'No share ID found in the URL.';
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/shared/${shareId}`);
    if (res.status === 404) {
      error.value = 'This shared query could not be found. It may have been deleted or the link is incorrect.';
      loading.value = false;
      return;
    }
    if (!res.ok) {
      error.value = `Failed to load the shared query (HTTP ${res.status}).`;
      loading.value = false;
      return;
    }
    data.value = await res.json();
  } catch {
    error.value = 'Unable to reach the Altair API. Please try again later.';
  } finally {
    loading.value = false;
  }

  loadPrism();
});

// ---------------------------------------------------------------------------
// Prism.js — loaded lazily from CDN
// ---------------------------------------------------------------------------

function loadPrism() {
  if (typeof window === 'undefined') return;

  if (!document.querySelector('#prism-css')) {
    const link = document.createElement('link');
    link.id = 'prism-css';
    link.rel = 'stylesheet';
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);
  }

  const injectScript = (src: string, id: string, onload?: () => void) => {
    if (document.querySelector(`#${id}`)) {
      onload?.();
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  };

  injectScript(
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
    'prism-core',
    () => {
      injectScript(
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
        'prism-autoloader',
        () => {
          (window as any).Prism?.highlightAll();
        }
      );
    }
  );
}
</script>

<template>
  <div class="sqv-root" :data-theme="theme">
    <!-- Topbar -->
    <header class="sqv-topbar">
      <a href="https://altairgraphql.dev" class="sqv-brand" aria-label="Altair GraphQL">
        <img src="/assets/img/altair_logo_128.png" alt="" class="sqv-brand-logo" />
        <span class="sqv-brand-name">Altair GraphQL</span>
      </a>
      <button class="sqv-theme-toggle" @click="toggleTheme" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`">
        <!-- Sun icon -->
        <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <!-- Moon icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </header>

    <!-- Main content -->
    <main class="sqv-wrapper">
      <!-- Loading -->
      <div v-if="loading" class="sqv-loading" aria-live="polite">
        <span class="sqv-spinner" aria-hidden="true"></span>
        <span>Loading shared query…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="sqv-error" role="alert">
        <div class="sqv-error-icon" aria-hidden="true">⚠</div>
        <p>{{ error }}</p>
        <a href="https://altairgraphql.dev" class="sqv-back-link">← Back to Altair docs</a>
      </div>

      <!-- Loaded -->
      <div v-else-if="data" class="sqv-card">
        <!-- Card header -->
        <div class="sqv-card-header">
          <h1 class="sqv-query-name">{{ queryName }}</h1>
          <div v-if="apiUrl" class="sqv-endpoint">
            <span class="sqv-endpoint-label">Endpoint</span>
            <span class="sqv-endpoint-url">{{ apiUrl }}</span>
          </div>
        </div>

        <!-- Query -->
        <section class="sqv-section">
          <h2 class="sqv-section-title">Query</h2>
          <pre class="sqv-code-block"><code class="language-graphql">{{ gqlQuery }}</code></pre>
        </section>

        <!-- Variables -->
        <section v-if="variables" class="sqv-section">
          <h2 class="sqv-section-title">Variables</h2>
          <pre class="sqv-code-block"><code class="language-json">{{ variables }}</code></pre>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="sqv-footer">
      <a href="https://altairgraphql.dev" class="sqv-footer-link">
        <img src="/assets/img/altair_logo_128.png" alt="" class="sqv-footer-logo" />
        <span>Powered by <strong>Altair GraphQL Client</strong></span>
      </a>
    </footer>
  </div>
</template>

<style scoped>
/* -------------------------------------------------------------------------
   Root — map VitePress brand/bg/text tokens onto local aliases.
   When data-theme="dark" we add the .dark class so vars.css dark overrides
   cascade in automatically.
   ---------------------------------------------------------------------- */
.sqv-root {
  --bg:           var(--vp-c-bg,       #ffffff);
  --bg-soft:      var(--vp-c-bg-soft,  #f6f6f7);
  --bg-elv:       var(--vp-c-bg-elv,   #ffffff);
  --divider:      var(--vp-c-divider,  #e2e2e3);
  --text-1:       var(--vp-c-text-1,   rgba(60,60,67));
  --text-2:       var(--vp-c-text-2,   rgba(60,60,67,.78));
  --text-3:       var(--vp-c-text-3,   rgba(60,60,67,.56));
  --brand:        var(--vp-c-brand-1,  #3451b2);
  --brand-2:      var(--vp-c-brand-2,  #3a5ccc);
  --brand-soft:   var(--vp-c-brand-soft, rgba(100,108,255,.14));
  --brand-border: var(--vp-c-indigo-3, #5672cd);
  --code-bg:      var(--vp-c-bg-alt,   #f6f6f7);
  --code-color:   var(--vp-c-text-1,   rgba(60,60,67));

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--vp-font-family-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  transition: background 0.2s, color 0.2s;
}

/* Dark overrides — vars.css already handles everything via .dark on :root,
   but since our root element IS the :root equiv here we patch code colors. */
.sqv-root[data-theme='dark'] {
  --code-bg:    #161618;
  --code-color: rgba(255,255,245,.86);
}

/* -------------------------------------------------------------------------
   Topbar
   ---------------------------------------------------------------------- */
.sqv-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  border-bottom: 1px solid var(--divider);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sqv-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-1);
}

.sqv-brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.sqv-brand-name {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.sqv-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--divider);
  border-radius: 8px;
  background: var(--bg-soft);
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.sqv-theme-toggle:hover {
  background: var(--bg-elv);
  color: var(--text-1);
}

/* -------------------------------------------------------------------------
   Main wrapper
   ---------------------------------------------------------------------- */
.sqv-wrapper {
  flex: 1;
  max-width: 860px;
  width: 100%;
  margin: 2.5rem auto;
  padding: 0 1.25rem;
}

/* -------------------------------------------------------------------------
   Loading
   ---------------------------------------------------------------------- */
.sqv-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-2);
  padding: 3rem 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sqv-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid var(--divider);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* -------------------------------------------------------------------------
   Error
   ---------------------------------------------------------------------- */
.sqv-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-2);
}

.sqv-error-icon {
  font-size: 2rem;
  color: #f59e0b;
}

.sqv-back-link {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--brand);
  text-decoration: none;
}

.sqv-back-link:hover {
  text-decoration: underline;
}

/* -------------------------------------------------------------------------
   Card
   ---------------------------------------------------------------------- */
.sqv-card {
  border: 1px solid var(--divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-soft);
}

/* -------------------------------------------------------------------------
   Card header
   ---------------------------------------------------------------------- */
.sqv-card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--divider);
  background: var(--bg-elv);
}

.sqv-query-name {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-1);
  margin: 0 0 0.25rem;
  border: none;
  padding: 0;
  letter-spacing: -0.01em;
}

.sqv-endpoint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.sqv-endpoint-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
}

.sqv-endpoint-url {
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.85rem;
  color: var(--text-2);
  word-break: break-all;
}

/* -------------------------------------------------------------------------
   Sections
   ---------------------------------------------------------------------- */
.sqv-section {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--divider);
}

.sqv-section:last-child {
  border-bottom: none;
}

.sqv-section-title {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  margin: 0 0 0.875rem;
  border: none;
  padding: 0;
}

/* -------------------------------------------------------------------------
   Code block
   ---------------------------------------------------------------------- */
.sqv-code-block {
  background: var(--code-bg) !important;
  border: 1px solid var(--divider);
  border-radius: 8px;
  overflow: auto;
  padding: 0 !important;
  margin: 0 !important;
  white-space: pre;
}

.sqv-code-block code {
  display: block;
  padding: 1.25rem 1.5rem !important;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace !important;
  font-size: 0.875rem !important;
  line-height: 1.7 !important;
  background: transparent !important;
  color: var(--code-color);
  tab-size: 2;
  white-space: pre;
}

/* -------------------------------------------------------------------------
   Footer
   ---------------------------------------------------------------------- */
.sqv-footer {
  border-top: 1px solid var(--divider);
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: center;
}

.sqv-footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-2);
  font-size: 0.875rem;
  transition: color 0.15s;
}

.sqv-footer-link:hover {
  color: var(--text-1);
}

.sqv-footer-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.7;
}

.sqv-footer-link strong {
  color: var(--brand);
}

/* -------------------------------------------------------------------------
   Responsive
   ---------------------------------------------------------------------- */
@media (max-width: 600px) {
  .sqv-card-header,
  .sqv-section {
    padding: 1.25rem;
  }

  .sqv-query-name {
    font-size: 1.25rem;
  }

  .sqv-code-block code {
    font-size: 0.8rem !important;
    padding: 1rem !important;
  }
}
</style>
