import { EventEmitter } from "node:events";

export type SquadRealtimeEvent = {
  type: string;
  actorId?: string;
  missionId?: string;
};

const GLOBAL_KEY = "__conduit_realtime_broker__";

function getBroker(): EventEmitter {
  const globalNs = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: EventEmitter;
  };
  if (!globalNs[GLOBAL_KEY]) {
    globalNs[GLOBAL_KEY] = new EventEmitter();
  }
  return globalNs[GLOBAL_KEY];
}

export function publishSquadChange(
  squadId: string,
  event: SquadRealtimeEvent,
) {
  getBroker().emit(squadId, event);
}

export function subscribeSquad(
  squadId: string,
  listener: (event: SquadRealtimeEvent) => void,
) {
  getBroker().on(squadId, listener);
  return () => {
    getBroker().off(squadId, listener);
  };
}