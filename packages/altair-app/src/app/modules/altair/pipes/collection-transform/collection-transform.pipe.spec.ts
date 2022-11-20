import { CollectionTransformPipe } from './collection-transform.pipe';

describe('TransformPipe', () => {
  it('create an instance', () => {
    const pipe = new CollectionTransformPipe();
    expect(pipe).toBeTruthy();
  });
});
