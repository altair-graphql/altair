const loop = new Proxy({}, {
  get() {
    return loop;
  },
  set() { return true; }
}) as any;

const stub = new Proxy(module.exports, {
  get() {
    return loop;
  },
  set() { return true; }
});

export default stub;
module.exports = stub;
