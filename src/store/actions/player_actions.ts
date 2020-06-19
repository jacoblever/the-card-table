import { Action } from "redux";
import { Player } from "../state";
import { RemoteAction } from "./actions";


export const PLAYERS_UPDATE = "PLAYERS_UPDATE";
export interface PlayersUpdateAction extends Action<typeof PLAYERS_UPDATE> {
  players: Player[];
}

export const NAME_CHANGE = "NAME_CHANGE";
export interface NameChangeAction extends RemoteAction<typeof NAME_CHANGE> {
  playerId: string;
  name: string;
}

export function nameChange(playerId: string, name: string): NameChangeAction {
  return {
    type: NAME_CHANGE,
    remote: false,
    playerId: playerId,
    name: name,
  };
}

export const KICK_PLAYER = "KICK_PLAYER";
export interface KickPlayerAction extends RemoteAction<typeof KICK_PLAYER> {
  playerId: string;
}

export function kickPlayer(playerId: string): KickPlayerAction {
  return {
    type: KICK_PLAYER,
    playerId: playerId,
    remote: false,
  };
}

export type PlayerActions = PlayersUpdateAction
  | NameChangeAction
  | KickPlayerAction;
