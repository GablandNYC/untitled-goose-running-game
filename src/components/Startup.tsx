import { useEffect } from "react";
import { useActions } from "koota/react";
import { actions } from "@/core/actions";

const PLAYER_COUNT = 4;

export function Startup() {
  const { spawnGoose, spawnGrassAlongTrack, spawnCamera } = useActions(actions);

  useEffect(() => {
    const geese = Array.from({ length: PLAYER_COUNT }, (_, i) => spawnGoose({ index: i }));
    const grass = spawnGrassAlongTrack();
    const camera = spawnCamera(geese[0]);
    return () => {
      camera.destroy();
      grass.forEach((g) => g.destroy());
      geese.forEach((g) => g.destroy());
    };
  }, [spawnGoose, spawnGrassAlongTrack, spawnCamera]);

  return null;
}
