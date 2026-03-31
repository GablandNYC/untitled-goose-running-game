import { Channel, Presence } from "phoenix";
import { getSocket, getPlayerId, connectSocket } from "./socket";

export type GamePlayer = {
  id: string;
  name: string;
};

export type GameCallbacks = {
  onPlayersChanged: (players: GamePlayer[]) => void;
  onPositionUpdate: (playerId: string, progress: number) => void;
  onGameStarted: () => void;
  onGameEnded?: () => void;
};

let gameChannel: Channel | null = null;
let gamePresence: Presence | null = null;
let lastSendTime = 0;

const SEND_INTERVAL = 100; // ~10Hz

function collectPlayers(presence: Presence): GamePlayer[] {
  const players: GamePlayer[] = [];
  presence.list((id: string, p: { metas: Array<{ player_name?: string }> }) => {
    players.push({ id, name: p.metas[0]?.player_name ?? id });
  });
  return players;
}

export function joinGame(
  gameId: string,
  playerName: string,
  callbacks: GameCallbacks,
): Promise<{ players: GamePlayer[] }> {
  // Ensure socket is connected (handles direct URL navigation to game page)
  if (!getSocket()) {
    connectSocket(playerName);
  }

  const socket = getSocket()!;
  gameChannel = socket.channel(`game:${gameId}`, {});
  gamePresence = new Presence(gameChannel);

  return new Promise((resolve, reject) => {
    let initialSyncDone = false;

    gamePresence!.onSync(() => {
      const players = collectPlayers(gamePresence!);
      if (!initialSyncDone) {
        initialSyncDone = true;
        resolve({ players });
      }
      callbacks.onPlayersChanged(players);
    });

    gameChannel!.on("position_update", (payload: { player_id: string; progress: number }) => {
      callbacks.onPositionUpdate(payload.player_id, payload.progress);
    });

    gameChannel!.on("game_started", () => {
      callbacks.onGameStarted();
    });

    gameChannel!.on("game_ended", () => {
      callbacks.onGameEnded?.();
    });

    gameChannel!
      .join()
      .receive("ok", () => {
        // resolve happens on first presence sync
      })
      .receive("error", (resp: unknown) => reject(new Error(JSON.stringify(resp))));
  });
}

export function getGamePlayers(): GamePlayer[] {
  if (!gamePresence) return [];
  return collectPlayers(gamePresence);
}

export function startGame(): void {
  gameChannel?.push("start_game", {});
}

export function sendPositionUpdate(progress: number): void {
  const now = Date.now();
  if (now - lastSendTime < SEND_INTERVAL) return;
  lastSendTime = now;
  gameChannel?.push("position_update", { progress });
}

export function isInGame(): boolean {
  return gameChannel !== null;
}

export function updateGameCallbacks(callbacks: Partial<GameCallbacks>): void {
  if (!gameChannel) return;

  if (callbacks.onPositionUpdate) {
    gameChannel.off("position_update");
    gameChannel.on("position_update", (payload: { player_id: string; progress: number }) => {
      callbacks.onPositionUpdate!(payload.player_id, payload.progress);
    });
  }

  if (callbacks.onGameStarted) {
    gameChannel.off("game_started");
    gameChannel.on("game_started", () => {
      callbacks.onGameStarted!();
    });
  }

  if (callbacks.onPlayersChanged && gamePresence) {
    gamePresence.onSync(() => {
      const players = collectPlayers(gamePresence!);
      callbacks.onPlayersChanged!(players);
    });
  }

  if (callbacks.onGameEnded) {
    gameChannel.off("game_ended");
    gameChannel.on("game_ended", () => {
      callbacks.onGameEnded!();
    });
  }
}

export function leaveGame(): void {
  gameChannel?.leave();
  gameChannel = null;
  gamePresence = null;
  lastSendTime = 0;
}
