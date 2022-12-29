export abstract class ValueObject<T> {
  private readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public value() {
    return this.props;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }

    // return shallowEqual(this.props, vo.props)
    return this.props === vo.props;
  }
}
