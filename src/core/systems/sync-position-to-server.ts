import type { World } from "koota";
import { IsSelf, RaceProgress } from "../traits";
import { sendPositionUpdate } from "../../lib/game-socket";

export function syncPositionToServer(world: World) {
  for (const entity of world.query(IsSelf, RaceProgress)) {
    const progress = entity.get(RaceProgress);
    if (progress) {
      sendPositionUpdate(progress.value);
    }
  }
}
