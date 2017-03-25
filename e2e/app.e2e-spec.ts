import { AltairPage } from './app.po';

describe('altair App', () => {
  let page: AltairPage;

  beforeEach(() => {
    page = new AltairPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
