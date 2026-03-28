function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad2d(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return (h & 1 ? -u : u) + (h & 2 ? -v : v);
}

const perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) perm[i] = i;
for (let i = 255; i > 0; i--) {
  const j = (Math.imul(i, 0x5bd1e995) >>> 0) % (i + 1);
  const tmp = perm[i];
  perm[i] = perm[j];
  perm[j] = tmp;
}
for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

export function noise2D(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[xi] + yi];
  const ab = perm[perm[xi] + yi + 1];
  const ba = perm[perm[xi + 1] + yi];
  const bb = perm[perm[xi + 1] + yi + 1];

  const mix = (a: number, b: number, t: number) => a + t * (b - a);

  return mix(
    mix(grad2d(aa, xf, yf), grad2d(ba, xf - 1, yf), u),
    mix(grad2d(ab, xf, yf - 1), grad2d(bb, xf - 1, yf - 1), u),
    v,
  );
}
