import { DefaultPipe } from './default.pipe';

describe('DefaultPipe', () => {
  it('create an instance', () => {
    const pipe = new DefaultPipe();
    expect(pipe).toBeTruthy();
  });
});
