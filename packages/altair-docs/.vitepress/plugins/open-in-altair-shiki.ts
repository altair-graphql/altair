import { toString } from 'hast-util-to-string';
import { ShikijiTransformer } from 'shikiji';
export function openInAltairShikiPlugin(): ShikijiTransformer {
  return {
    code(node) {
      if (this.options.lang === 'graphql') {
        node.children.push({
          type: 'element',
          tagName: 'button',
          properties: {
            type: 'button',
            data: toString(node),
            title: 'Open in Altair Web',
            'aria-label': 'Open in Altair Web',
            class: 'open-in-altair-btn',
            'data-name': 'open-in-altair-button',
            onclick: /* javascript */ `
              const url = new window.URL('https://web.altairgraphql.dev/');
              const params = new URLSearchParams();
              params.set('query', this.attributes.data.value);
              params.set('variables', JSON.stringify({}));     
              url.search = params.toString();
              
              window.open(url.toString(), '_blank');
            `.trim(),
          },
          children: [
            {
              type: 'text',
              value: 'Open in Altair Web',
            },
          ],
        });
      }
    },
  };
}
