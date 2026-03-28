import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useTraitEffect } from "koota/react";
import type { Entity } from "koota";
import { Group } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Billboard, Text, useGLTF, useAnimations } from "@react-three/drei";
import { IsGoose, Player, RaceProgress, Ref } from "@/core/traits";

const GOOSE_MODEL_PATH = "/assets/models/goose.glb";
const GOOSE_FONT_URL = "/assets/fonts/LilitaOne-Regular.ttf";

function GooseView({ entity, name }: { entity: Entity; name: string }) {
  const { scene, animations } = useGLTF(GOOSE_MODEL_PATH);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const groupRef = useRef<Group>(null);
  const { actions } = useAnimations(animations, groupRef);

  const handleInit = useCallback(
    (group: Group | null) => {
      if (!group || !entity.isAlive()) return;
      entity.add(Ref(group));
      return () => entity.remove(Ref);
    },
    [entity],
  );

  const timeOffset = useMemo(() => {
    const id = entity.id();
    const hash = Math.sin(id * 9301 + 49297) * 49267;
    return (hash - Math.floor(hash)) * 2;
  }, [entity]);

  useEffect(() => {
    const run = actions["GooseRun"];
    if (!run) return;
    run.reset().fadeIn(0.2).play();
    // eslint-disable-next-line react-hooks/immutability
    run.time = timeOffset;
  }, [actions, timeOffset]);

  useTraitEffect(entity, RaceProgress, (progress) => {
    if (progress && progress.value >= 1) {
      actions["GooseRun"]?.fadeOut(0.3);
      const idle = actions["GooseIdle"];
      if (!idle) return;
      idle.reset().fadeIn(0.2).play();
      // eslint-disable-next-line react-hooks/immutability
      idle.time = timeOffset;
    }
  });

  return (
    <group
      ref={(node) => {
        (groupRef as React.MutableRefObject<Group | null>).current = node;
        handleInit(node);
      }}
    >
      <primitive object={clone} rotation={[0, Math.PI / 2, 0]} castShadow />
      <Billboard position={[0, 2.2, 0]} follow>
        <Text
          font={GOOSE_FONT_URL}
          fontSize={0.35}
          color="#fffbe6"
          outlineWidth={0.05}
          outlineColor="#4a3520"
          anchorX="center"
          anchorY="bottom"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

useGLTF.preload(GOOSE_MODEL_PATH);

export function GooseRenderer() {
  const geese = useQuery(IsGoose, Player);
  return (
    <>
      {geese.map((entity) => (
        <GooseView key={entity.id()} entity={entity} name={entity.get(Player)?.name ?? "Goose"} />
      ))}
    </>
  );
}
