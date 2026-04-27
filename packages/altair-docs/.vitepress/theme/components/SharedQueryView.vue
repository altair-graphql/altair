<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { initializeClient, type SharedQueryWithContent } from '@altairgraphql/api-utils';

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

const apiClient = initializeClient(
  (import.meta as any).env?.PROD ? 'production' : 'development'
);

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
const data = ref<SharedQueryWithContent | null>(null);

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------

const queryName = computed(() => data.value?.query.name ?? 'Shared Query');
const gqlQuery  = computed(() => data.value?.query.content?.query ?? '');
const apiUrl    = computed(() => data.value?.query.content?.apiUrl ?? '');

const variables = computed(() => {
  const raw = data.value?.query.content?.variables ?? '';
  if (!raw) return '';
  try { return JSON.stringify(JSON.parse(raw), null, 2); }
  catch { return raw; }
});

// ---------------------------------------------------------------------------
// Share ID
// ---------------------------------------------------------------------------

function getShareId(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('id');
}

// ---------------------------------------------------------------------------
// Open in Altair
// ---------------------------------------------------------------------------

const openInAltair = () => {
  const url    = new URL('https://web.altairgraphql.dev/');
  const params = new URLSearchParams();
  params.set('query', gqlQuery.value);
  params.set('variables', variables.value || JSON.stringify({}));
  if (apiUrl.value) params.set('endpoint', apiUrl.value);
  url.search = params.toString();
  window.open(url.toString(), '_blank');
};

// ---------------------------------------------------------------------------
// Mount: theme + fetch + prism
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
    data.value = await apiClient.getSharedPublicQuery(shareId);
  } catch (e: any) {
    if (e?.response?.status === 404) {
      error.value = 'This shared query could not be found. It may have been deleted or the link is incorrect.';
    } else {
      error.value = 'Unable to reach the Altair API. Please try again later.';
    }
  } finally {
    loading.value = false;
  }

  loadPrism();
});

// ---------------------------------------------------------------------------
// Prism.js — lazy CDN load
// ---------------------------------------------------------------------------

function loadPrism() {
  if (typeof window === 'undefined') return;

  if (!document.querySelector('#prism-css')) {
    const link   = document.createElement('link');
    link.id      = 'prism-css';
    link.rel     = 'stylesheet';
    link.href    = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);
  }

  const injectScript = (src: string, id: string, onload?: () => void) => {
    if (document.querySelector(`#${id}`)) { onload?.(); return; }
    const s    = document.createElement('script');
    s.id       = id;
    s.src      = src;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  };

  injectScript(
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
    'prism-core',
    () => injectScript(
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
      'prism-autoloader',
      () => (window as any).Prism?.highlightAll()
    )
  );
}
</script>

<template>
  <div class="sqv-root" :data-theme="theme">
    <main class="sqv-wrapper">

      <!-- Loading -->
      <div v-if="loading" class="sqv-loading" aria-live="polite">
        <span class="sqv-spinner" aria-hidden="true"></span>
        <span>Loading shared query…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="sqv-error" role="alert">
        <div class="sqv-error-icon" aria-hidden="true">⚠</div>
        <p class="sqv-error-message">{{ error }}</p>
        <a href="https://altairgraphql.dev" class="sqv-back-link">← Back to Altair docs</a>
      </div>

      <!-- Loaded -->
      <div v-else-if="data" class="sqv-card">

        <!-- Card header -->
        <div class="sqv-card-header">
          <div class="sqv-header-meta">
            <h1 class="sqv-query-name">{{ queryName }}</h1>
            <div v-if="apiUrl" class="sqv-endpoint">
              <span class="sqv-endpoint-label">Endpoint</span>
              <span class="sqv-endpoint-url">{{ apiUrl }}</span>
            </div>
          </div>
          <div class="sqv-header-actions">
            <button
              class="sqv-theme-toggle"
              type="button"
              @click="toggleTheme"
              :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            >
              <!-- Sun -->
              <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
              <!-- Moon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <button
              class="open-in-altair-btn sqv-open-btn"
              type="button"
              title="Open in Altair Web"
              aria-label="Open in Altair Web"
              @click="openInAltair"
            >
              Open in Altair Web
            </button>
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

    <!-- Attribution -->
    <p class="sqv-attribution">
      <a href="https://altairgraphql.dev" class="sqv-attribution-link" aria-label="Altair GraphQL Client">
        <img src="/assets/img/altair_logo_128.png" alt="Altair GraphQL Client" class="sqv-attribution-logo" />
      </a>
    </p>
  </div>
</template>

<style scoped>
/* =========================================================================
   Design tokens — explicit layered values for both themes.
   .dark on <html> (toggled by toggleTheme) switches the token set.
   ========================================================================= */
.sqv-root {
  /* Light theme */
  --bg:            #f0f0f3;
  --bg-card:       #ffffff;
  --bg-header:     #fafafa;
  --bg-section:    #fafafa;
  --divider:       #e4e4e8;
  --text-1:        #1a1a2e;
  --text-2:        #4a4a6a;
  --text-3:        #9a9ab0;
  --brand:         var(--vp-c-brand-1,    #3451b2);
  --brand-soft:    var(--vp-c-brand-soft, rgba(100,108,255,.12));
  --brand-border:  var(--vp-c-indigo-3,   #5672cd);
  --code-bg:       #1e1e2e;
  --code-color:    #cdd6f4;
  --radius-card:   12px;
  --radius-btn:    6px;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--vp-font-family-base,
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  transition: background 0.2s, color 0.2s;
}

/* Dark theme overrides */
.sqv-root[data-theme='dark'] {
  --bg:            #0d0d12;
  --bg-card:       #18181f;
  --bg-header:     #1e1e27;
  --bg-section:    #18181f;
  --divider:       #2a2a38;
  --text-1:        rgba(235,235,245,.9);
  --text-2:        rgba(235,235,245,.55);
  --text-3:        rgba(235,235,245,.32);
  --code-bg:       #13131a;
}
/* =========================================================================
   Page wrapper — centred, padded, responsive width
   ========================================================================= */
.sqv-wrapper {
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 1.5rem;
}

@media (min-width: 640px) {
  .sqv-wrapper { padding: 2.5rem 1.5rem 2rem; }
}

@media (min-width: 960px) {
  .sqv-wrapper { padding: 3rem 2rem 2.5rem; }
}

/* =========================================================================
   Loading
   ========================================================================= */
.sqv-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-2);
  padding: 5rem 1rem;
  font-size: 0.95rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.sqv-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--divider);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}

/* =========================================================================
   Error
   ========================================================================= */
.sqv-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
}

.sqv-error-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.sqv-error-message {
  color: var(--text-2);
  font-size: 0.95rem;
  max-width: 36ch;
  line-height: 1.6;
  margin: 0;
}

.sqv-back-link {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--brand);
  text-decoration: none;
}
.sqv-back-link:hover { text-decoration: underline; }

/* =========================================================================
   Card
   ========================================================================= */
.sqv-card {
  border: 1px solid var(--divider);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
}

/* =========================================================================
   Card header
   ========================================================================= */
.sqv-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--divider);
  background: var(--bg-header);
}

@media (min-width: 640px) {
  .sqv-card-header { padding: 1.5rem 1.75rem 1.25rem; }
}

/* On very small screens stack meta above actions */
@media (max-width: 480px) {
  .sqv-card-header { flex-direction: column; }
}

.sqv-header-meta {
  flex: 1;
  min-width: 0; /* allow text truncation inside flex child */
}

.sqv-query-name {
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-1);
  margin: 0;
  border: none;
  padding: 0;
  letter-spacing: -0.02em;
  /* Graceful overflow on narrow screens */
  overflow-wrap: break-word;
  word-break: break-word;
}

.sqv-endpoint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.sqv-endpoint-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
  line-height: 1.6;
}

.sqv-endpoint-url {
  font-family: var(--vp-font-family-mono,
    ui-monospace, 'Cascadia Code', Menlo, monospace);
  font-size: 0.8rem;
  color: var(--text-2);
  overflow-wrap: break-word;
  word-break: break-all;
  line-height: 1.5;
}

/* =========================================================================
   Header actions (theme toggle + open button)
   ========================================================================= */
.sqv-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  /* Align to top-right on desktop; on mobile (stacked) align left */
  align-self: flex-start;
}

@media (max-width: 480px) {
  .sqv-header-actions { align-self: flex-start; }
}

.sqv-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 1px solid var(--divider);
  border-radius: var(--radius-btn);
  background: var(--bg-card);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sqv-theme-toggle:hover {
  background: var(--bg-header);
  border-color: var(--text-3);
  color: var(--text-1);
}

/* Override the global position:absolute from custom.css */
.sqv-header-actions :deep(.open-in-altair-btn) {
  position: static;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: var(--radius-btn);
  white-space: nowrap;
  border-color: var(--divider) !important;
  background: var(--bg-card) !important;
  color: var(--text-2) !important;
  transition: all 0.2s ease;
}

.sqv-header-actions :deep(.open-in-altair-btn:hover) {
  background: var(--bg-header) !important;
  border-color: var(--text-3) !important;
  color: var(--text-1) !important;
}

/* =========================================================================
   Sections
   ========================================================================= */
.sqv-section {
  padding: 1.25rem;
  border-bottom: 1px solid var(--divider);
  background: var(--bg-section);
}

.sqv-section:last-child { border-bottom: none; }

@media (min-width: 640px) {
  .sqv-section { padding: 1.5rem 1.75rem; }
}

.sqv-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  margin: 0 0 0.75rem;
  border: none;
  padding: 0;
}

/* =========================================================================
   Code block
   ========================================================================= */
.sqv-code-block {
  background: var(--code-bg) !important;
  border: 1px solid var(--divider);
  border-radius: 8px;
  overflow: auto;
  padding: 0 !important;
  margin: 0 !important;
  /* Ensure horizontal scroll rather than overflow on mobile */
  -webkit-overflow-scrolling: touch;
}

.sqv-code-block code {
  display: block;
  padding: 1rem 1.25rem !important;
  font-family: var(--vp-font-family-mono,
    ui-monospace, 'Cascadia Code', Menlo, monospace) !important;
  font-size: 0.84rem !important;
  line-height: 1.7 !important;
  background: transparent !important;
  color: var(--code-color);
  tab-size: 2;
  white-space: pre;
  /* Prevent wrapping — horizontal scroll is preferred for code */
  word-break: normal;
  overflow-wrap: normal;
}

@media (min-width: 640px) {
  .sqv-code-block code {
    padding: 1.25rem 1.5rem !important;
    font-size: 0.875rem !important;
  }
}

/* =========================================================================
   Attribution
   ========================================================================= */
.sqv-attribution {
  padding: 1.25rem 1rem 1.5rem;
  text-align: center;
  margin: 0;
}

.sqv-attribution-link {
  display: inline-block;
  transition: filter 0.2s;
}

.sqv-attribution-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
  filter: grayscale(100%) opacity(30%);
}

.sqv-attribution-link:hover .sqv-attribution-logo {
  filter: grayscale(100%) opacity(55%);
}
</style>
