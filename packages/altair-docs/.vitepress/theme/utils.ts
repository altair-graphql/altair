import { HeadConfig, PageData, SiteData } from 'vitepress';

export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
export const APPEARANCE_KEY = 'vitepress-theme-appearance';
export const HASH_RE = /#.*$/;
export const EXT_RE = /(index)?\.(md|html)$/;

export const inBrowser = typeof document !== 'undefined';

export const notFoundPageData: PageData = {
  relativePath: '',
  filePath: '',
  title: '404',
  description: 'Not Found',
  headers: [],
  frontmatter: { sidebar: false, layout: 'page' },
  lastUpdated: 0,
  isNotFound: true,
};

export function isActive(
  currentPath: string,
  matchPath?: string,
  asRegex: boolean = false
): boolean {
  if (matchPath === undefined) {
    return false;
  }

  currentPath = normalize(`/${currentPath}`);

  if (asRegex) {
    return new RegExp(matchPath).test(currentPath);
  }

  if (normalize(matchPath) !== currentPath) {
    return false;
  }

  const hashMatch = matchPath.match(HASH_RE);

  if (hashMatch) {
    return (inBrowser ? location.hash : '') === hashMatch[0];
  }

  return true;
}

export function normalize(path: string): string {
  return decodeURI(path)
    .replace(HASH_RE, '')
    .replace(EXT_RE, '');
}

export function isExternal(path: string): boolean {
  return EXTERNAL_URL_RE.test(path);
}

/**
 * this merges the locales data to the main data by the route
 */
export function resolveSiteDataByRoute(
  siteData: SiteData,
  relativePath: string
): SiteData {
  const localeIndex =
    Object.keys(siteData.locales).find(
      key =>
        key !== 'root' &&
        !isExternal(key) &&
        isActive(relativePath, `/${key}/`, true)
    ) || 'root';

  return {
    ...siteData,
    localeIndex,
    lang: siteData.locales[localeIndex]?.lang ?? siteData.lang,
    dir: siteData.locales[localeIndex]?.dir ?? siteData.dir,
    title: siteData.locales[localeIndex]?.title ?? siteData.title,
    titleTemplate:
      siteData.locales[localeIndex]?.titleTemplate ?? siteData.titleTemplate,
    description:
      siteData.locales[localeIndex]?.description ?? siteData.description,
    head: mergeHead(siteData.head, siteData.locales[localeIndex]?.head ?? []),
    themeConfig: {
      ...siteData.themeConfig,
      ...siteData.locales[localeIndex]?.themeConfig,
    },
  };
}

/**
 * Create the page title string based on config.
 */
export function createTitle(siteData: SiteData, pageData: PageData): string {
  const title = pageData.title || siteData.title;
  const template = pageData.titleTemplate ?? siteData.titleTemplate;

  if (typeof template === 'string' && template.includes(':title')) {
    return template.replace(/:title/g, title);
  }

  const templateString = createTitleTemplate(siteData.title, template);

  if (title === templateString.slice(3)) {
    return title;
  }

  return `${title}${templateString}`;
}

function createTitleTemplate(
  siteTitle: string,
  template?: string | boolean
): string {
  if (template === false) {
    return '';
  }

  if (template === true || template === undefined) {
    return ` | ${siteTitle}`;
  }

  if (siteTitle === template) {
    return '';
  }

  return ` | ${template}`;
}

function hasTag(head: HeadConfig[], tag: HeadConfig) {
  const [tagType, tagAttrs] = tag;
  if (tagType !== 'meta') return false;
  const keyAttr = Object.entries(tagAttrs)[0]; // First key
  if (keyAttr == null) return false;
  return head.some(
    ([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]
  );
}

export function mergeHead(prev: HeadConfig[], curr: HeadConfig[]) {
  return [...prev.filter(tagAttrs => !hasTag(curr, tagAttrs)), ...curr];
}

// https://github.com/rollup/rollup/blob/fec513270c6ac350072425cc045db367656c623b/src/utils/sanitizeFileName.ts

const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

export function sanitizeFileName(name: string): string {
  const match = DRIVE_LETTER_REGEX.exec(name);
  const driveLetter = match ? match[0] : '';

  return (
    driveLetter +
    name
      .slice(driveLetter.length)
      .replace(INVALID_CHAR_REGEX, '_')
      .replace(/(^|\/)_+(?=[^/]*$)/, '$1')
  );
}

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

const extraExts =
  (typeof process === 'object' && process.env.VITE_EXTRA_EXTENSIONS) ||
  (import.meta as any).env?.VITE_EXTRA_EXTENSIONS ||
  '';

// md, html? are intentionally omitted, see treatAsHtml
const KNOWN_EXTENSIONS = new Set(
  (
    '3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,' +
    'eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,man,' +
    'mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,' +
    'p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,' +
    'tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,yaml,yml,zip' +
    (extraExts && typeof extraExts === 'string' ? ',' + extraExts : '')
  ).split(',')
);

export function treatAsHtml(filename: string): boolean {
  const ext = filename.split('.').pop();

  return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}

// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path: string) {
  let pagePath = path.replace(/\.html$/, '');
  pagePath = decodeURIComponent(pagePath);
  pagePath = pagePath.replace(/\/$/, '/index'); // /foo/ -> /foo/index
  if (import.meta.env.DEV) {
    // always force re-fetch content in dev
    pagePath += `.md?t=${Date.now()}`;
  } else {
    // in production, each .md file is built into a .md.js file following
    // the path conversion scheme.
    // /foo/bar.html -> ./foo_bar.md
    if (inBrowser) {
      const base = import.meta.env.BASE_URL;
      pagePath =
        sanitizeFileName(
          pagePath.slice(base.length).replace(/\//g, '_') || 'index'
        ) + '.md';
      // client production build needs to account for page hash, which is
      // injected directly in the page's html
      let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
      if (!pageHash) {
        pagePath = pagePath.endsWith('_index.md')
          ? pagePath.slice(0, -9) + '.md'
          : pagePath.slice(0, -3) + '_index.md';
        pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
      }
      if (!pageHash) return null;
      pagePath = `${base}${__ASSETS_DIR__}/${pagePath}.${pageHash}.js`;
    } else {
      // ssr build uses much simpler name mapping
      pagePath = `./${sanitizeFileName(
        pagePath.slice(1).replace(/\//g, '_')
      )}.md.js`;
    }
  }

  return pagePath;
}
