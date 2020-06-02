import { BackendCardState, BackendPlayer, databaseToBackendPlayer } from "./backend_state";
import { DbConnection, DbPlayer } from "./database";

export const BACKEND_DROP_CARD = "DROP_CARD";
export const BACKEND_TURN_OVER_CARD = "TURN_OVER_CARD";
export const BACKEND_GET_INITIAL_STATE = "GET_INITIAL_STATE";
export const BACKEND_INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export const BACKEND_PLAYERS_UPDATE = "PLAYERS_UPDATE";
export const BACKEND_NAME_CHANGE = "NAME_CHANGE";

export interface BackendDropCardAction {
  type: typeof BACKEND_DROP_CARD;
  cardId: string;
  location: [number, number];
  zIndex: number;
  nowHeldBy: string | null;
}

export interface BackendTurnOverCardAction {
  type: typeof BACKEND_TURN_OVER_CARD;
  cardId: string;
}

export interface BackendGetInitialStateAction {
  type: typeof BACKEND_GET_INITIAL_STATE;
}

export interface BackendInitialCardStateAction {
  type: typeof BACKEND_INITIAL_CARD_STATE;
  state: BackendCardState;
}

export interface BackendPlayersUpdateAction {
  type: typeof BACKEND_PLAYERS_UPDATE;
  players: BackendPlayer[];
}

export interface BackendNameChangeAction {
  type: typeof BACKEND_NAME_CHANGE;
  playerId: string;
  name: string;
}

export function backendPlayersUpdate(players: DbPlayer[], connections: DbConnection[]): BackendPlayersUpdateAction {
  return {
    type: BACKEND_PLAYERS_UPDATE,
    players: players.map(player => {
      let online = connections.filter(x => x.playerId === player.playerId).length > 0;
      return databaseToBackendPlayer(player, online);
    }),
  };
}

export type BackendActionTypes = BackendDropCardAction
  | BackendTurnOverCardAction
  | BackendGetInitialStateAction
  | BackendInitialCardStateAction
  | BackendPlayersUpdateAction
  | BackendNameChangeAction;
