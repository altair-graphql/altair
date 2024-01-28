export class CorsWorker {
  private readonly url: string | URL;
  private readonly options?: WorkerOptions;

  // Have this only to trick Webpack into properly transpiling
  // the url address from the component which uses it
  constructor(url: string | URL, options?: WorkerOptions) {
    this.url = url;
    this.options = options;
  }

  async createWorker(): Promise<Worker> {
    const f = await fetch(this.url);
    const t = await f.text();
    const b = new Blob([t], {
      type: 'application/javascript',
    });
    const url = URL.createObjectURL(b);
    const worker = new Worker(url, this.options);
    return worker;
  }
}
