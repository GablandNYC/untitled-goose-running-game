declare module "phoenix" {
  export class Socket {
    constructor(endPoint: string, opts?: Record<string, unknown>);
    connect(): void;
    disconnect(): void;
    channel(topic: string, params?: Record<string, unknown>): Channel;
  }

  export class Channel {
    join(): Push;
    leave(): Push;
    push(event: string, payload?: Record<string, unknown>): Push;
    on(event: string, callback: (payload: any) => void): number;
    off(event: string, ref?: number): void;
  }

  export class Push {
    receive(status: string, callback: (response: any) => void): Push;
  }

  export class Presence {
    constructor(channel: Channel);
    onSync(callback: () => void): void;
    list(callback?: (id: string, presence: any) => void): Record<string, any>;
  }
}
