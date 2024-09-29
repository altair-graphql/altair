import { PluginV3Context } from './context';

interface StylesData {
  styleUrls: string[];
  styles: string[];
  htmlClasses: string[];
}
export abstract class AltairV3Panel {
  abstract create(ctx: PluginV3Context, container: HTMLElement): void;

  /**
   * Initialize the panel with the provided data
   * @internal
   */
  initialize(ctx: PluginV3Context, data?: StylesData) {
    if (data) {
      this.setupStyles(data);
    }

    // Initialize the panel
    const div = document.createElement('div');
    div.id = 'altair-plugin-panel';
    document.body.appendChild(div);
    this.create(ctx, div);
  }

  private setupStyles(data: StylesData) {
    // Get the CSS style URL from the app and apply it to the panel
    data.styleUrls.forEach((styleUrl) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      // link.crossOrigin = 'anonymous';
      link.href = styleUrl;
      document.head.appendChild(link);
    });

    this.injectCSS(data.styles.join('\n'));

    // set the background color of the panel to the theme background color
    this.injectCSS(`
      body {
        background: transparent;
      }
    `);

    data.htmlClasses.forEach((htmlClass) => {
      document.documentElement.classList.add(htmlClass);
    });
  }

  private injectCSS(css: string) {
    let el = document.createElement('style');
    el.innerText = css;
    document.head.appendChild(el);
    return el;
  }
}
