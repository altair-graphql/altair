<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useData } from 'vitepress';
import { codeToHtml, codeToThemedTokens, type ThemedToken } from 'shikiji';
import {
  initializeClient,
  type SharedQueryWithContent,
} from '@altairgraphql/api-utils';

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

const apiClient = initializeClient(
  (import.meta as any).env?.PROD ? 'production' : 'development'
);

// ---------------------------------------------------------------------------
// Theme — delegate entirely to VitePress
// ---------------------------------------------------------------------------

const { isDark } = useData();

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
// Syntax highlighting (shikiji — dual light/dark theme via CSS variables)
// ---------------------------------------------------------------------------

const SHIKI_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

/**
 * shikiji 0.10 emits hardcoded `color:#xxx` on <span> elements and
 * `background-color:#xxx` on <pre>, making them impossible to override from
 * CSS without !important.  We normalise the output so that:
 *   - span inline style:  `color:#xxx`           → `--shiki-light:#xxx`
 *   - <pre> inline style: `background-color:#xxx` and `color:#xxx` stripped
 *     (background is provided by .sqv-code-block via --code-bg, colour is
 *     inherited from individual token spans)
 * After this transform plain CSS rules work without !important.
 */
function processShikiHtml(html: string): string {
  return html
    // Rename color: → --shiki-light: on every token <span>
    .replace(/<span style="color:/g, '<span style="--shiki-light:')
    // Strip background-color and color from the <pre> inline style
    .replace(
      /(<pre[^>]*) style="([^"]*)"/,
      (_, pre, style) => {
        const cleaned = style
          .split(';')
          .filter((prop: string) => {
            const t = prop.trim();
            return t && !t.startsWith('background-color:') && !t.startsWith('color:');
          })
          .join(';');
        return cleaned ? `${pre} style="${cleaned}"` : pre;
      }
    );
}

const highlightedQuery = ref('');
const highlightedVariables = ref('');

async function updateHighlights() {
  if (gqlQuery.value) {
    highlightedQuery.value = processShikiHtml(await codeToHtml(gqlQuery.value, {
      lang: 'graphql',
      themes: SHIKI_THEMES,
    }));
  } else {
    highlightedQuery.value = '';
  }
  if (variables.value) {
    highlightedVariables.value = processShikiHtml(await codeToHtml(variables.value, {
      lang: 'json',
      themes: SHIKI_THEMES,
    }));
  } else {
    highlightedVariables.value = '';
  }
}

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
  const url = new URL('https://web.altairgraphql.dev/');
  const params = new URLSearchParams();
  params.set('query', gqlQuery.value);
  params.set('variables', variables.value || JSON.stringify({}));
  if (apiUrl.value) params.set('endpoint', apiUrl.value);
  url.search = params.toString();
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
};

// ---------------------------------------------------------------------------
// Mount: theme + fetch + prism
// ---------------------------------------------------------------------------

onMounted(async () => {
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
      error.value =
        'This shared query could not be found. It may have been deleted or the link is incorrect.';
    } else {
      error.value = 'Unable to reach the Altair API. Please try again later.';
    }
  } finally {
    loading.value = false;
  }

  updateHighlights();
});

// ---------------------------------------------------------------------------
// Image modal
// ---------------------------------------------------------------------------

const showImageModal = ref(false);
const previewCanvasRef = ref<HTMLCanvasElement | null>(null);
const imageDownloading = ref(false);

type ImageContent = 'query' | 'variables' | 'both';
type ImagePadding = 'compact' | 'normal' | 'spacious';

const imageContent = ref<ImageContent>('query');
const imagePadding = ref<ImagePadding>('normal');
const selectedGradient = ref(0);

const gradients = [
  { name: 'Sunset',   stops: ['#ff6b6b', '#feca57'] },
  { name: 'Ocean',    stops: ['#667eea', '#764ba2'] },
  { name: 'Candy',    stops: ['#f093fb', '#f5576c'] },
  { name: 'Aqua',     stops: ['#4facfe', '#00f2fe'] },
  { name: 'Mint',     stops: ['#43e97b', '#38f9d7'] },
  { name: 'Rose',     stops: ['#fa709a', '#fee140'] },
  { name: 'Midnight', stops: ['#0f2027', '#203a43', '#2c5364'] },
  { name: 'Breeze',   stops: ['#e0c3fc', '#8ec5fc'] },
] as const;

const previewCode = computed(() => {
  if (imageContent.value === 'query') return gqlQuery.value;
  if (imageContent.value === 'variables') return variables.value;
  const parts: string[] = [];
  if (gqlQuery.value)  parts.push(gqlQuery.value);
  if (variables.value) parts.push('# Variables\n' + variables.value);
  return parts.join('\n\n');
});

function openImageModal() {
  imageContent.value = 'query';
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
}

// ---------------------------------------------------------------------------
// Canvas rendering — used for both preview and download
// ---------------------------------------------------------------------------

const PADDING_VALUES: Record<ImagePadding, number> = { compact: 24, normal: 48, spacious: 80 };
const FONT_SIZE    = 13;
const LINE_HEIGHT  = Math.round(FONT_SIZE * 1.75); // ~23px
const CODE_PAD_X   = 24;
const CODE_PAD_TOP = 20;
const CODE_PAD_BOT = 24;
const TITLEBAR_H   = 44;
const WIN_RADIUS   = 10;
const FONT_FACE    = `${FONT_SIZE}px ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace`;

// one-dark-pro — matches the dark window chrome colour (#1e1e2e)
const CANVAS_THEME  = 'one-dark-pro' as const;
const CANVAS_FG     = '#abb2bf'; // one-dark-pro default foreground
// FontStyle bitmask values (mirrors shikiji's FontStyle enum)
const FS_ITALIC = 1;
const FS_BOLD   = 2;

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

/** Return token lines for the current imageContent selection. */
async function buildTokenLines(): Promise<ThemedToken[][]> {
  const expand = (s: string) => s.replace(/\t/g, '    ');
  const opts = (lang: 'graphql' | 'json') =>
    ({ lang, theme: CANVAS_THEME } as const);

  if (imageContent.value === 'query') {
    return codeToThemedTokens(expand(gqlQuery.value) || ' ', opts('graphql'));
  }
  if (imageContent.value === 'variables') {
    return codeToThemedTokens(expand(variables.value) || ' ', opts('json'));
  }

  // 'both' — tokenize each section with the right language then merge
  const result: ThemedToken[][] = [];
  if (gqlQuery.value) {
    const qLines = await codeToThemedTokens(expand(gqlQuery.value), opts('graphql'));
    result.push(...qLines);
  }
  if (gqlQuery.value && variables.value) {
    // blank separator + comment header
    result.push(
      [],
      [{ content: '# --- Variables ---', color: '#7f848e', offset: 0, fontStyle: FS_ITALIC }],
      [],
    );
  }
  if (variables.value) {
    const vLines = await codeToThemedTokens(expand(variables.value), opts('json'));
    result.push(...vLines);
  }
  return result;
}

async function renderToCanvas(canvas: HTMLCanvasElement, scale: number) {
  const pad        = PADDING_VALUES[imagePadding.value];
  const tokenLines = await buildTokenLines();

  // Measure widths with a scratch canvas
  const mc   = document.createElement('canvas');
  const mctx = mc.getContext('2d')!;
  mctx.font  = FONT_FACE;
  const maxLineW = tokenLines.reduce((m, tokens) => {
    const lineText = tokens.map(t => t.content).join('');
    return Math.max(m, mctx.measureText(lineText).width);
  }, 0);

  const winW   = Math.max(320, Math.ceil(maxLineW) + CODE_PAD_X * 2);
  const winH   = TITLEBAR_H + CODE_PAD_TOP + tokenLines.length * LINE_HEIGHT + CODE_PAD_BOT;
  const totalW = winW + pad * 2;
  const totalH = winH + pad * 2;

  canvas.width        = Math.ceil(totalW * scale);
  canvas.height       = Math.ceil(totalH * scale);
  canvas.style.width  = totalW + 'px';
  canvas.style.height = totalH + 'px';

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Gradient background
  const g   = gradients[selectedGradient.value];
  const grd = ctx.createLinearGradient(0, 0, totalW, totalH);
  (g.stops as readonly string[]).forEach((c, i) =>
    grd.addColorStop(i / (g.stops.length - 1), c)
  );
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, totalW, totalH);

  // Window drop shadow
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur    = 24;
  ctx.shadowOffsetY = 6;
  drawRoundRect(ctx, pad, pad, winW, winH, WIN_RADIUS);
  ctx.fillStyle = '#1e1e2e';
  ctx.fill();
  ctx.restore();

  // Window body
  ctx.fillStyle = '#1e1e2e';
  drawRoundRect(ctx, pad, pad, winW, winH, WIN_RADIUS);
  ctx.fill();

  // Titlebar (rounded top only)
  ctx.fillStyle = '#2a2a38';
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pad + WIN_RADIUS, pad);
  ctx.lineTo(pad + winW - WIN_RADIUS, pad);
  ctx.arcTo(pad + winW, pad, pad + winW, pad + WIN_RADIUS, WIN_RADIUS);
  ctx.lineTo(pad + winW, pad + TITLEBAR_H);
  ctx.lineTo(pad, pad + TITLEBAR_H);
  ctx.lineTo(pad, pad + WIN_RADIUS);
  ctx.arcTo(pad, pad, pad + WIN_RADIUS, pad, WIN_RADIUS);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Traffic lights
  (['#ff5f57', '#febc2e', '#28c840'] as const).forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(pad + 16 + i * 18, pad + TITLEBAR_H / 2, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Code — draw token by token so each gets its highlight colour
  ctx.textBaseline = 'top';
  tokenLines.forEach((tokens, lineIdx) => {
    let x = pad + CODE_PAD_X;
    const y = pad + TITLEBAR_H + CODE_PAD_TOP + lineIdx * LINE_HEIGHT;
    tokens.forEach(token => {
      const italic = token.fontStyle != null && (token.fontStyle & FS_ITALIC) !== 0;
      const bold   = token.fontStyle != null && (token.fontStyle & FS_BOLD)   !== 0;
      ctx.font      = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${FONT_FACE}`;
      ctx.fillStyle = token.color ?? CANVAS_FG;
      ctx.fillText(token.content, x, y);
      x += ctx.measureText(token.content).width;
    });
  });
}

// Redraw preview canvas whenever modal is open and any setting changes
watch(
  () => [showImageModal.value, selectedGradient.value, imagePadding.value, previewCode.value],
  async ([visible]) => {
    if (!visible) return;
    await nextTick();
    if (previewCanvasRef.value) {
      await renderToCanvas(previewCanvasRef.value, Math.min(window.devicePixelRatio || 1, 2));
    }
  }
);

async function downloadImage() {
  if (imageDownloading.value) return;
  imageDownloading.value = true;
  try {
    const canvas = document.createElement('canvas');
    await renderToCanvas(canvas, 2);
    const link = document.createElement('a');
    link.download = `${queryName.value.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    imageDownloading.value = false;
  }
}
</script>

<template>
  <div class="sqv-root" :data-theme="isDark ? 'dark' : 'light'">
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
        <a href="https://altairgraphql.dev" class="sqv-back-link"
          >← Back to Altair docs</a
        >
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
              @click="isDark = !isDark"
              :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
            >
              <!-- Sun -->
              <svg
                v-if="isDark"
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <!-- Moon -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <!-- Share as Image -->
            <button
              class="sqv-icon-btn"
              type="button"
              title="Share as Image"
              aria-label="Share as Image"
              @click="openImageModal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
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
          <div class="sqv-code-block" v-html="highlightedQuery"></div>
        </section>

        <!-- Variables -->
        <section v-if="variables" class="sqv-section">
          <h2 class="sqv-section-title">Variables</h2>
          <div class="sqv-code-block" v-html="highlightedVariables"></div>
        </section>
      </div>
    </main>

    <!-- Attribution -->
    <p class="sqv-attribution">
      <a
        href="https://altairgraphql.dev"
        class="sqv-attribution-link"
        aria-label="Altair GraphQL Client"
      >
        <img
          src="/assets/img/altair_logo_128.png"
          alt="Altair GraphQL Client"
          class="sqv-attribution-logo"
        />
      </a>
    </p>

    <!-- =====================================================================
         Image generation modal
         ===================================================================== -->
    <Teleport to="body">
      <Transition name="img-modal">
      <div
        v-if="showImageModal"
        class="img-overlay"
        :data-theme="isDark ? 'dark' : 'light'"
        role="dialog"
          aria-modal="true"
          aria-label="Share as Image"
          @click.self="closeImageModal"
        >
          <div class="img-modal">
            <!-- Modal header -->
            <div class="img-modal-header">
              <span class="img-modal-title">Share as Image</span>
              <button
                class="img-close-btn"
                type="button"
                aria-label="Close"
                @click="closeImageModal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

          <!-- Preview area -->
          <div class="img-preview-wrap">
            <canvas ref="previewCanvasRef" class="img-preview-canvas"></canvas>
          </div>

            <!-- Controls -->
            <div class="img-controls">
              <!-- Gradient picker -->
              <div class="img-control-group">
                <span class="img-control-label">Background</span>
                <div class="img-swatches">
                  <button
                    v-for="(g, i) in gradients"
                    :key="g.name"
                    type="button"
                    class="img-swatch"
                    :class="{ 'img-swatch--active': selectedGradient === i }"
                    :style="{
                      background: `linear-gradient(135deg, ${g.stops.join(', ')})`,
                    }"
                    :title="g.name"
                    :aria-label="g.name"
                    :aria-pressed="selectedGradient === i"
                    @click="selectedGradient = i"
                  />
                </div>
              </div>

              <!-- Content picker (only shown if variables exist) -->
              <div v-if="variables" class="img-control-group">
                <span class="img-control-label">Content</span>
                <div class="img-pill-group">
                  <button
                    v-for="opt in ['query', 'variables', 'both'] as ImageContent[]"
                    :key="opt"
                    type="button"
                    class="img-pill"
                    :class="{ 'img-pill--active': imageContent === opt }"
                    @click="imageContent = opt"
                  >
                    {{
                      opt === 'both'
                        ? 'Both'
                        : opt.charAt(0).toUpperCase() + opt.slice(1)
                    }}
                  </button>
                </div>
              </div>

              <!-- Padding picker -->
              <div class="img-control-group">
                <span class="img-control-label">Padding</span>
                <div class="img-pill-group">
                  <button
                    v-for="opt in [
                      'compact',
                      'normal',
                      'spacious',
                    ] as ImagePadding[]"
                    :key="opt"
                    type="button"
                    class="img-pill"
                    :class="{ 'img-pill--active': imagePadding === opt }"
                    @click="imagePadding = opt"
                  >
                    {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Download button -->
            <div class="img-footer">
              <button
                class="img-download-btn"
                type="button"
                :disabled="imageDownloading"
                @click="downloadImage"
              >
                <svg
                  v-if="!imageDownloading"
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span
                  class="sqv-spinner sqv-spinner--sm"
                  v-else
                  aria-hidden="true"
                ></span>
                {{ imageDownloading ? 'Generating…' : 'Download PNG' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  --bg-header:     #f7f7fa;
  --bg-section:    #ffffff;
  --divider:       #e4e4e8;
  --text-1:        #1a1a2e;
  --text-2:        #4a4a6a;
  --text-3:        #9a9ab0;
  --brand:         var(--vp-c-brand-1,    #3451b2);
  --brand-soft:    var(--vp-c-brand-soft, rgba(100,108,255,.1));
  --code-bg:       #f6f8fa;
  --radius-card:   16px;
  --radius-btn:    8px;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(
    --vp-font-family-base,
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  );
  transition: background 0.2s, color 0.2s;
}

/* Dark theme overrides */
.sqv-root[data-theme='dark'] {
  --bg:         #0d0d12;
  --bg-card:    #18181f;
  --bg-header:  #18181f;
  --bg-section: #18181f;
  --divider:    #2a2a38;
  --text-1:     rgba(235,235,245,.9);
  --text-2:     rgba(235,235,245,.55);
  --text-3:     rgba(235,235,245,.28);
  --code-bg:    #0d1117;
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
  .sqv-wrapper {
    padding: 2.5rem 1.5rem 2rem;
  }
}

@media (min-width: 960px) {
  .sqv-wrapper {
    padding: 3rem 2rem 2.5rem;
  }
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sqv-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--divider);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}

.sqv-spinner--sm {
  width: 14px;
  height: 14px;
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
.sqv-back-link:hover {
  text-decoration: underline;
}

/* =========================================================================
   Card
   ========================================================================= */
.sqv-card {
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--bg-card);
  box-shadow:
    0 0 0 1px rgba(0,0,0,.04),
    0 4px 8px rgba(0,0,0,.04),
    0 16px 48px rgba(0,0,0,.08);
}

.sqv-root[data-theme='dark'] .sqv-card {
  box-shadow:
    0 4px 8px rgba(0,0,0,.3),
    0 16px 48px rgba(0,0,0,.4);
}

/* =========================================================================
   Card header
   ========================================================================= */
.sqv-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 1.5rem 1.5rem;
  background: var(--bg-header);
}

@media (min-width: 640px) {
  .sqv-card-header { padding: 2rem 2rem 1.75rem; }
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
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
  line-height: 1.6;
}

.sqv-endpoint-url {
  font-family: var(
    --vp-font-family-mono,
    ui-monospace,
    'Cascadia Code',
    Menlo,
    monospace
  );
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
  .sqv-header-actions {
    align-self: flex-start;
  }
}

.sqv-theme-toggle,
.sqv-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-btn);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.sqv-theme-toggle:hover,
.sqv-icon-btn:hover {
  background: var(--divider);
  color: var(--text-1);
}

/* Override the global position:absolute from custom.css.
   Scoped :deep() compiles to [data-v-xxx] .open-in-altair-btn (specificity 0,2,0)
   which beats custom.css's plain .open-in-altair-btn (0,1,0) — no !important needed. */
.sqv-header-actions :deep(.open-in-altair-btn) {
  position: static;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: var(--radius-btn);
  white-space: nowrap;
  border: none;
  background: var(--divider);
  color: var(--text-2);
  transition: background 0.15s, color 0.15s;
}

.sqv-header-actions :deep(.open-in-altair-btn:hover) {
  background: var(--text-3);
  color: var(--text-1);
}

/* =========================================================================
   Sections
   ========================================================================= */
.sqv-section {
  padding: 1.75rem 1.5rem;
  background: var(--bg-section);
}

.sqv-section + .sqv-section {
  padding-top: 0;
}

@media (min-width: 640px) {
  .sqv-section { padding: 2rem; }
  .sqv-section + .sqv-section { padding-top: 0; }
}

.sqv-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  margin: 0 0 1rem;
  border: none;
  padding: 0;
}

/* =========================================================================
   Code block
   ========================================================================= */
.sqv-code-block {
  border-radius: 10px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Shiki emits a <pre> inside our wrapper div.
   We add .sqv-root as ancestor to beat any VitePress base pre styles. */
.sqv-root .sqv-code-block :deep(pre) {
  margin: 0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: var(--code-bg);
  font-family: var(
    --vp-font-family-mono,
    ui-monospace,
    'Cascadia Code',
    Menlo,
    monospace
  );
  font-size: 0.84rem;
  line-height: 1.7;
  tab-size: 2;
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
}

.sqv-root .sqv-code-block :deep(code) {
  font-family: inherit;
  font-size: inherit;
  background: transparent;
}

/* After processShikiHtml, spans carry --shiki-light and --shiki-dark instead
   of hardcoded color: values, so these rules work without !important. */
.sqv-root .sqv-code-block :deep(span) {
  color: var(--shiki-light);
}

.sqv-root[data-theme='dark'] .sqv-code-block :deep(span) {
  color: var(--shiki-dark);
}

@media (min-width: 640px) {
  .sqv-root .sqv-code-block :deep(pre) {
    padding: 1.25rem 1.5rem;
    font-size: 0.875rem;
  }
}

/* =========================================================================
   Attribution
   ========================================================================= */
.sqv-attribution {
  padding: 1.5rem 1rem 2rem;
  text-align: center;
  margin: 0;
}

.sqv-attribution-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg);
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,.12),
    inset 0 1px 2px rgba(0,0,0,.08);
  transition: box-shadow 0.2s, background 0.2s;
}

.sqv-root[data-theme='dark'] .sqv-attribution-link {
  box-shadow:
    inset 0 2px 5px rgba(0,0,0,.4),
    inset 0 1px 2px rgba(0,0,0,.3);
}

.sqv-attribution-link:hover {
  box-shadow:
    inset 0 1px 2px rgba(0,0,0,.08),
    inset 0 1px 1px rgba(0,0,0,.04);
}

.sqv-root[data-theme='dark'] .sqv-attribution-link:hover {
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,.25),
    inset 0 1px 1px rgba(0,0,0,.2);
}

.sqv-attribution-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
  filter: grayscale(100%) opacity(35%);
  transition: filter 0.2s;
}

.sqv-attribution-link:hover .sqv-attribution-logo {
  filter: grayscale(60%) opacity(60%);
}

/* =========================================================================
   Image modal — overlay (also acts as theme root for teleported content)
   ========================================================================= */
.img-overlay {
  /* Light theme tokens */
  --modal-bg:              #ffffff;
  --modal-bg-preview:      #eeeef2;
  --modal-text-1:          #1a1a2e;
  --modal-text-2:          #4a4a6a;
  --modal-text-3:          #9a9ab0;
  --modal-subtle:          rgba(0,0,0,.05);
  --modal-pill-trough:     rgba(0,0,0,.06);
  --modal-pill-active:     #e4e4e8;
  --modal-close-hover:     #ebebef;
  --modal-shadow:          0 32px 80px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06);

  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.img-overlay[data-theme='dark'] {
  --modal-bg:              #18181f;
  --modal-bg-preview:      #0d0d12;
  --modal-text-1:          rgba(235,235,245,.9);
  --modal-text-2:          rgba(235,235,245,.55);
  --modal-text-3:          rgba(235,235,245,.28);
  --modal-subtle:          rgba(255,255,255,.04);
  --modal-pill-trough:     rgba(0,0,0,.25);
  --modal-pill-active:     #2a2a38;
  --modal-close-hover:     #2a2a38;
  --modal-shadow:          0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05);

  background: rgba(0,0,0,.65);
}

/* =========================================================================
   Image modal — panel
   ========================================================================= */
.img-modal {
  background: var(--modal-bg);
  border-radius: 14px;
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--modal-shadow);
  overflow: hidden;
  max-height: calc(100vh - 2rem);
}

.img-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  flex-shrink: 0;
}

.img-modal-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--modal-text-1);
  letter-spacing: -0.01em;
}

.img-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--modal-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.img-close-btn:hover {
  background: var(--modal-close-hover);
  color: var(--modal-text-1);
}

/* =========================================================================
   Preview area — scrollable
   ========================================================================= */
.img-preview-wrap {
  overflow: auto;
  padding: 20px;
  text-align: center;
  background: var(--modal-bg-preview);
  flex: 1;
  min-height: 0;
}

.img-preview-canvas {
  display: block;
  margin: 0 auto;
  border-radius: 12px;
}

/* The element captured by html2canvas — uses only inline styles internally */
.img-preview {
  display: inline-flex;
  text-align: left;
  border-radius: 12px;
  flex-shrink: 0;
  transition: background 0.35s ease, padding 0.25s ease;
}

.img-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  flex-shrink: 0;
}

.img-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #2a2a38;
  flex-shrink: 0;
}

.img-modal-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.8);
  letter-spacing: -0.01em;
}

.img-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(235, 235, 245, 0.4);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}
.img-close-btn:hover {
  background: #2a2a38;
  color: rgba(235, 235, 245, 0.9);
}

/* =========================================================================
   Preview area — scrollable
   ========================================================================= */
.img-preview-wrap {
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  background: #0d0d12;
  flex: 1;
  min-height: 0;
}

/* The element captured by html2canvas — uses only inline styles internally */
.img-preview {
  display: inline-flex;
  border-radius: 12px;
  flex-shrink: 0;
  transition:
    background 0.35s ease,
    padding 0.25s ease;
}

/* =========================================================================
   Window chrome — all inline-style-like scoped rules so they render
   faithfully under html2canvas (no external/CDN CSS dependency)
   ========================================================================= */
.img-window {
  background: #1e1e2e;
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0,0,0,.3),
    0 8px 32px rgba(0,0,0,.5),
    0 0 0 1px rgba(255,255,255,.06);
  min-width: 320px;
  width: max-content;
}

.img-window-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px 10px;
  background: #2a2a38;
}

.img-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.img-code {
  margin: 0;
  padding: 20px 24px 24px;
  font-family: ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Monaco,
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.75;
  color: #cdd6f4;
  background: #1e1e2e;
  white-space: pre;
  word-break: normal;
  tab-size: 2;
}

/* =========================================================================
   Controls bar
   ========================================================================= */
.img-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 14px 18px 16px;
  flex-shrink: 0;
}

.img-control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.img-control-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--modal-text-3);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Gradient swatches */
.img-swatches {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.img-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.15s;
  padding: 0;
  flex-shrink: 0;
}

.img-swatch:hover {
  transform: scale(1.18);
}

.img-swatch--active {
  border-color: var(--vp-c-brand-1, #64cb29);
  transform: scale(1.12);
}

/* Pill group — segmented control style, no borders */
.img-pill-group {
  display: flex;
  gap: 2px;
  background: var(--modal-pill-trough);
  border-radius: 8px;
  padding: 3px;
}

.img-pill {
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 5px;
  color: var(--modal-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.img-pill + .img-pill {
  border-left: none;
}

.img-pill:hover {
  background: var(--modal-subtle);
  color: var(--modal-text-2);
}

.img-pill--active {
  background: var(--modal-pill-active);
  color: var(--vp-c-brand-1, #64cb29);
}

/* =========================================================================
   Footer — download button
   ========================================================================= */
.img-footer {
  padding: 12px 18px 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.img-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 18px;
  border: none;
  border-radius: 7px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    opacity 0.15s,
    transform 0.1s;
}

.img-download-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-1, #64cb29);
  opacity: 0.88;
}

.img-download-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.img-download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =========================================================================
   Modal enter / leave transitions
   ========================================================================= */

/* Overlay fades */
.img-modal-enter-active,
.img-modal-leave-active {
  transition: opacity 0.22s ease;
}
.img-modal-enter-active .img-modal,
.img-modal-leave-active .img-modal {
  transition:
    opacity 0.22s ease,
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.img-modal-enter-from,
.img-modal-leave-to {
  opacity: 0;
}
.img-modal-enter-from .img-modal,
.img-modal-leave-to .img-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* Code content crossfade transition removed — preview is now canvas-based */
</style>
