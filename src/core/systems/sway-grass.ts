import type { World } from "koota";
import type { Mesh, BufferGeometry, BufferAttribute } from "three";
import { GrassBase, IsGrass, Position, Ref, Wind } from "../traits";
import { noise2D } from "../noise";

export function swayGrass(world: World) {
  const wind = world.get(Wind);
  if (!wind) return;

  const time = performance.now() * 0.001;

  for (const entity of world.query(IsGrass, Position, Ref, GrassBase)) {
    const pos = entity.get(Position)!;
    const ref = entity.get(Ref)! as Mesh;
    const base = entity.get(GrassBase)!;
    if (!ref || !base) continue;

    const geo = ref.geometry as BufferGeometry;
    const attr = geo.getAttribute("position") as BufferAttribute;
    const arr = attr.array as Float32Array;
    const vertCount = arr.length / 3;

    for (let i = 0; i < vertCount; i++) {
      const baseY = base[i * 3 + 1];
      const baseX = base[i * 3];
      const baseZ = base[i * 3 + 2];

      if (baseY < 0.01) {
        arr[i * 3] = baseX;
        arr[i * 3 + 1] = baseY;
        arr[i * 3 + 2] = baseZ;
        continue;
      }

      const worldX = pos.x + baseX;
      const worldZ = pos.z + baseZ;
      const heightFactor = baseY;

      const n1 = noise2D(
        worldX * 0.4 + time * wind.speed,
        worldZ * 0.4 + time * wind.speed * 0.6,
      );
      const n2 = noise2D(
        worldX * 0.3 - time * wind.speed * 0.4,
        worldZ * 0.3 + time * wind.speed * 0.3,
      );

      arr[i * 3] = baseX + n1 * wind.strength * heightFactor;
      arr[i * 3 + 1] = baseY;
      arr[i * 3 + 2] = baseZ + n2 * wind.strength * heightFactor * 0.6;
    }

    attr.needsUpdate = true;
  }
}
