interface MarkdownItMeta {
  order?: number;
  // add other properties if needed
}

declare module 'markdown-it' {
  interface MarkdownIt {
    meta: MarkdownItMeta;
  }
}
