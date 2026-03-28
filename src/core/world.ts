import { createWorld } from "koota";
import { Time, Wind } from "./traits";

export const world = createWorld(Time, Wind({ strength: 0.3 }));
