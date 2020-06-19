import { BackendCardState, BackendPlayer, databaseToBackendPlayer } from "./backend_state";
import { DbConnection, DbPlayer } from "./database";

export const BACKEND_DROP_CARDS = "DROP_CARDS";
export const BACKEND_GET_INITIAL_STATE = "GET_INITIAL_STATE";
export const BACKEND_INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export const BACKEND_PLAYERS_UPDATE = "PLAYERS_UPDATE";
export const BACKEND_NAME_CHANGE = "NAME_CHANGE";
export const BACKEND_KICK_PLAYER = "KICK_PLAYER";

export interface BackendDropCardsAction {
  type: typeof BACKEND_DROP_CARDS;
  remote: true,
  nowHeldBy: string | null,
  drops: {
    cardId: string,
    location: [number, number],
    zIndex: number,
    turnOver: boolean,
  }[],
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

export function backendDropCardsOnTable(cards: {cardId: string, turnOver?: boolean}[]): BackendDropCardsAction {
  return {
    type: BACKEND_DROP_CARDS,
    remote: true,
    nowHeldBy: null,
    drops: cards.map(x => {
      return {
        cardId: x.cardId,
        location: [120, 120],
        zIndex: 0,
        turnOver: x.turnOver,
      };
    }),
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

export type BackendActionTypes = BackendDropCardsAction
  | BackendGetInitialStateAction
  | BackendInitialCardStateAction
  | BackendPlayersUpdateAction
  | BackendNameChangeAction
  | BackendKickPlayerAction;
