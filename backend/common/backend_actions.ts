import { BackendCardState, BackendPlayer, databaseToBackendPlayer } from "./backend_state";
import { DbConnection, DbPlayer } from "./database";

export const BACKEND_DROP_CARD = "DROP_CARD";
export const BACKEND_TURN_OVER_CARD = "TURN_OVER_CARD";
export const BACKEND_GET_INITIAL_STATE = "GET_INITIAL_STATE";
export const BACKEND_INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export const BACKEND_PLAYERS_UPDATE = "PLAYERS_UPDATE";
export const BACKEND_NAME_CHANGE = "NAME_CHANGE";
export const BACKEND_KICK_PLAYER = "KICK_PLAYER";

export interface BackendDropCardAction {
  type: typeof BACKEND_DROP_CARD;
  cardId: string;
  location: [number, number];
  zIndex: number;
  nowHeldBy: string | null;
  remote: true,
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

export interface BackendKickPlayerAction {
  type: typeof BACKEND_KICK_PLAYER;
  playerId: string;
}

export function backendDropCardOnTable(cardId: string): BackendDropCardAction {
  return {
    type: BACKEND_DROP_CARD,
    cardId: cardId,
    location: [120, 120],
    zIndex: 0,
    nowHeldBy: null,
    remote: true,
  };
}

export function backendTurnCardOverTable(cardId: string): BackendDropCardAction {
  return {
    type: BACKEND_TURN_OVER_CARD,
    cardId: cardId,
  };
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
  | BackendNameChangeAction
  | BackendKickPlayerAction;
