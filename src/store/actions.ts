import { CardOwner, CardState, Coordinates, Player } from "./state";

export const PICK_UP_CARD = "PICK_UP_CARD";
export const MOVE_CARD = "MOVE_CARD";
export const DROP_CARD = "DROP_CARD";
export const TURN_OVER_CARD = "TURN_OVER_CARD";
export const WS_CONNECT = "WS_CONNECT";
export const WS_DISCONNECT = "WS_DISCONNECT";
export const INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export const PLAYERS_UPDATE = "PLAYERS_UPDATE";
export const NAME_CHANGE = "NAME_CHANGE";

interface RemoteAction {
    remote: boolean;
}

export interface PickUpCardAction extends RemoteAction {
    type: typeof PICK_UP_CARD;
    cardId: string;
    ensureIdentityStaysHidden: boolean;
}

export interface MoveCardAction extends RemoteAction {
    type: typeof MOVE_CARD;
    cardId: string;
    location: Coordinates;
}

export interface DropCardAction extends RemoteAction {
    type: typeof DROP_CARD;
    cardId: string;
    location: Coordinates;
    zIndex: number;
    nowHeldBy: CardOwner;
}

export interface TurnOverCardAction extends RemoteAction {
    type: typeof TURN_OVER_CARD;
    cardId: string;
}

export interface WsConnectAction {
    type: typeof WS_CONNECT;
}

export interface WsDisconnectAction {
    type: typeof WS_DISCONNECT;
}

export interface InitialCardStateAction {
  type: typeof INITIAL_CARD_STATE;
  state: CardState;
}

export interface PlayersUpdateAction {
  type: typeof PLAYERS_UPDATE;
  players: Player[];
}

export interface NameChangeAction extends RemoteAction{
  type: typeof NAME_CHANGE;
  playerId: string;
  name: string;
}

export type ActionTypes = PickUpCardAction
  | MoveCardAction
  | DropCardAction
  | TurnOverCardAction
  | WsConnectAction
  | WsDisconnectAction
  | InitialCardStateAction
  | PlayersUpdateAction
  | NameChangeAction;

export function pickUpCard(cardId: string, ensureIdentityStaysHidden = false): ActionTypes {
  return {
    type: PICK_UP_CARD,
    remote: false,
    cardId: cardId,
    ensureIdentityStaysHidden: ensureIdentityStaysHidden,
  };
}

export function moveCard(cardId: string, location: Coordinates): ActionTypes {
  return {
    type: MOVE_CARD,
    remote: false,
    cardId: cardId,
    location: location,
  };
}

export function dropCard(cardId: string, location: Coordinates, zIndex: number, nowHeldBy: CardOwner, remote: boolean = false): ActionTypes {
  return {
    type: DROP_CARD,
    remote: remote,
    cardId: cardId,
    location: location,
    zIndex: zIndex,
    nowHeldBy: nowHeldBy,
  };
}

export function turnOverCard(cardId: string, remote: boolean = false): ActionTypes {
  return {
    type: TURN_OVER_CARD,
    remote: remote,
    cardId: cardId,
  };
}

export function wsConnect(): ActionTypes {
  return {
    type: WS_CONNECT,
  };
}

export function wsDisconnect(): ActionTypes {
  return {
    type: WS_DISCONNECT,
  };
}

export function nameChange(playerId: string, name: string): ActionTypes {
  return {
    type: NAME_CHANGE,
    remote: false,
    playerId: playerId,
    name: name,
  };
}
