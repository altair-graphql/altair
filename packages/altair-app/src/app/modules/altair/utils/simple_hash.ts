export const hash = (s: string) => {
  /* Simple hash function. */
  let a = 1,
    c = 0,
    h,
    o;
  if (s) {
    a = 0;
    /*jshint plusplus:false bitwise:false*/
    /* eslint-disable */
    for (h = s.length - 1; h >= 0; h--) {
      o = s.charCodeAt(h);
      a = ((a << 6) & 268435455) + o + (o << 14);
      c = a & 266338304;
      a = c !== 0 ? a ^ (c >> 21) : a;
    }
  }
  return String(a);
};

export function uaSeedHash(seed: string) {
  return hash(`${navigator.userAgent}:${seed}`);
}
