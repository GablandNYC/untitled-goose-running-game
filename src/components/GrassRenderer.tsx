import { useCallback, useMemo } from "react";
import { useQuery } from "koota/react";
import type { Entity } from "koota";
import * as THREE from "three";
import { GrassBase, IsGrass, Ref } from "@/core/traits";

const BLADES_PER_PATCH = 10;
const FLOWERS_PER_PATCH = 4;
const PATCH_RADIUS = 0.8;

const TIP_COLOR = new THREE.Color("#6dbd45");
const ROOT_COLOR = new THREE.Color("#298a50");
const MID_COLOR = new THREE.Color().copy(ROOT_COLOR).lerp(TIP_COLOR, 0.4);

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function createPatchGeometry(seed: number) {
  const totalTris = BLADES_PER_PATCH * 2 + FLOWERS_PER_PATCH;
  const positions = new Float32Array(totalTris * 9);
  const colors = new Float32Array(totalTris * 9);

  let vi = 0;
  function pushVert(x: number, y: number, z: number, c: THREE.Color) {
    positions[vi * 3] = x;
    positions[vi * 3 + 1] = y;
    positions[vi * 3 + 2] = z;
    colors[vi * 3] = c.r;
    colors[vi * 3 + 1] = c.g;
    colors[vi * 3 + 2] = c.b;
    vi++;
  }

  for (let b = 0; b < BLADES_PER_PATCH; b++) {
    const bs = seed * 73 + b;
    const r0 = seededRandom(bs);
    const r1 = seededRandom(bs + 1000);
    const r2 = seededRandom(bs + 2000);
    const r3 = seededRandom(bs + 3000);

    // Place blades in a ring, leaning outward
    const ringAngle = (b / BLADES_PER_PATCH) * Math.PI * 2 + r0 * 0.6;
    const dist = 0.15 + r1 * PATCH_RADIUS;
    const bx = Math.cos(ringAngle) * dist;
    const bz = Math.sin(ringAngle) * dist;

    const height = 0.5 + r2 * 0.9;
    const halfWidth = 0.12 + r3 * 0.16;

    // Lean outward from center
    const lean = 0.1 + r2 * 0.15;
    const leanX = Math.cos(ringAngle) * lean;
    const leanZ = Math.sin(ringAngle) * lean;

    // Perpendicular to the radial direction for blade width
    const perpX = -Math.sin(ringAngle);
    const perpZ = Math.cos(ringAngle);

    // Front face — two triangles forming a wider blade
    // Bottom-left, bottom-right, tip
    pushVert(bx - perpX * halfWidth, 0, bz - perpZ * halfWidth, ROOT_COLOR);
    pushVert(bx + perpX * halfWidth, 0, bz + perpZ * halfWidth, ROOT_COLOR);
    pushVert(bx + leanX, height, bz + leanZ, TIP_COLOR);

    // Second triangle for thickness: bottom-left, tip, mid-back
    const backX = bx - Math.cos(ringAngle) * halfWidth * 0.4;
    const backZ = bz - Math.sin(ringAngle) * halfWidth * 0.4;
    pushVert(bx - perpX * halfWidth, 0, bz - perpZ * halfWidth, ROOT_COLOR);
    pushVert(bx + leanX, height, bz + leanZ, TIP_COLOR);
    pushVert(backX, 0, backZ, MID_COLOR);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function GrassPatchView({ entity }: { entity: Entity }) {
  const geometry = useMemo(() => createPatchGeometry(entity.id()), [entity]);

  const handleInit = useCallback(
    (mesh: THREE.Mesh | null) => {
      if (!mesh || !entity.isAlive()) return;
      const posAttr = mesh.geometry.getAttribute("position");
      entity.add(Ref(mesh));
      entity.add(GrassBase(new Float32Array(posAttr.array as Float32Array)));
      return () => {
        entity.remove(Ref);
        entity.remove(GrassBase);
      };
    },
    [entity],
  );

  return (
    <mesh ref={handleInit} geometry={geometry} scale={0.5}>
      <meshStandardMaterial
        vertexColors
        flatShading
        side={THREE.DoubleSide}
        roughness={0.9}
      />
    </mesh>
  );
}

export function GrassRenderer() {
  const patches = useQuery(IsGrass);
  return (
    <>
      {patches.map((entity) => (
        <GrassPatchView key={entity.id()} entity={entity} />
      ))}
    </>
  );
}
